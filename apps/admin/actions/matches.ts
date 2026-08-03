"use server";

import { revalidatePath } from "next/cache";
import {
  computePoolStandings,
  computeQualification,
  initialScoresForStatus,
  trialTemplateForPhase,
  trialsForTemplate,
  validateMatchCreation,
  type CreateMatchContext,
  type CreateMatchInput,
  type MatchPhase,
  type MatchStatus,
} from "@bible-masters/shared";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { requireStaffAuth } from "@/lib/auth";
import type { ActionState } from "./tournaments";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@bible-masters/shared";

type Supabase = SupabaseClient<Database>;

async function buildCreateMatchContext(
  supabase: Supabase,
  tournamentId: number,
  team1Id: number,
  team2Id: number,
  phase: MatchPhase
): Promise<CreateMatchContext> {
  const { data: teams } = await supabase.from("teams").select("id, tournament_id").in("id", [team1Id, team2Id]);
  const teamsBelongToTournament =
    (teams ?? []).length === 2 && (teams ?? []).every((t) => t.tournament_id === tournamentId);

  const { count: poolCount } = await supabase
    .from("pools")
    .select("id", { count: "exact", head: true })
    .eq("tournament_id", tournamentId);

  const { data: poolTeamRows } = await supabase
    .from("pool_teams")
    .select("pool_id, team_id, pool:pools!inner(tournament_id)")
    .eq("pool.tournament_id", tournamentId)
    .in("team_id", [team1Id, team2Id]);

  const poolIdByTeam = new Map((poolTeamRows ?? []).map((r) => [r.team_id, r.pool_id]));
  const poolId1 = poolIdByTeam.get(team1Id) ?? null;
  const poolId2 = poolIdByTeam.get(team2Id) ?? null;
  const teamsInSamePool = poolId1 !== null && poolId1 === poolId2;
  const poolId = teamsInSamePool ? poolId1 : null;

  let poolMatchCount = 0;
  let pairAlreadyExistsInPool = false;
  if (poolId !== null) {
    const { data: teamsInPool } = await supabase.from("pool_teams").select("team_id").eq("pool_id", poolId);
    const teamIds = (teamsInPool ?? []).map((t) => t.team_id);

    const { data: poolMatches } = await supabase
      .from("matches")
      .select("team1_id, team2_id")
      .eq("tournament_id", tournamentId)
      .eq("phase", "Poule")
      .in("team1_id", teamIds)
      .in("team2_id", teamIds);

    poolMatchCount = (poolMatches ?? []).length;
    pairAlreadyExistsInPool = (poolMatches ?? []).some(
      (m) => (m.team1_id === team1Id && m.team2_id === team2Id) || (m.team1_id === team2Id && m.team2_id === team1Id)
    );
  }

  const qualification = await computeTournamentQualification(supabase, tournamentId);

  const { data: semiMatches } = await supabase
    .from("matches")
    .select("id, team1_id, team2_id, status, score_team1, score_team2")
    .eq("tournament_id", tournamentId)
    .eq("phase", "Demi");

  const semiCount = (semiMatches ?? []).length;
  const teamAlreadyInSemi = (semiMatches ?? []).some(
    (m) => m.team1_id === team1Id || m.team2_id === team1Id || m.team1_id === team2Id || m.team2_id === team2Id
  );
  const completedSemiMatches = (semiMatches ?? [])
    .filter((m) => m.status === "Termine")
    .map((m) => ({
      team1Id: m.team1_id,
      team2Id: m.team2_id,
      scoreTeam1: m.score_team1 ?? 0,
      scoreTeam2: m.score_team2 ?? 0,
    }));

  const { count: existingMatchCountForPhase } = await supabase
    .from("matches")
    .select("id", { count: "exact", head: true })
    .eq("tournament_id", tournamentId)
    .eq("phase", phase);

  return {
    teamsBelongToTournament,
    poolCount: poolCount ?? 0,
    teamsInSamePool,
    poolId,
    poolMatchCount,
    pairAlreadyExistsInPool,
    qualification: { ready: qualification.ready, qualifiedTeamIds: qualification.qualifiedTeamIds },
    semiCount,
    teamAlreadyInSemi,
    completedSemiMatches,
    existingMatchCountForPhase: existingMatchCountForPhase ?? 0,
  };
}

/** Réutilise la logique métier partagée pour recalculer la qualification côté serveur admin. */
async function computeTournamentQualification(supabase: Supabase, tournamentId: number) {
  const { data: pools } = await supabase.from("pools").select("id, name").eq("tournament_id", tournamentId);
  const { data: poolTeamRows } = await supabase
    .from("pool_teams")
    .select("pool_id, team:teams(id, name)")
    .in("pool_id", (pools ?? []).map((p) => p.id));

  const poolTeams = (poolTeamRows ?? []).map((r) => ({
    poolId: r.pool_id,
    teamId: (r.team as any)?.id,
    teamName: (r.team as any)?.name ?? "",
  }));

  const { data: completedMatches } = await supabase
    .from("matches")
    .select("team1_id, team2_id, score_team1, score_team2")
    .eq("tournament_id", tournamentId)
    .eq("phase", "Poule")
    .eq("status", "Termine");

  const standings = computePoolStandings(
    pools ?? [],
    poolTeams,
    (completedMatches ?? []).map((m) => ({
      team1Id: m.team1_id,
      team2Id: m.team2_id,
      scoreTeam1: m.score_team1 ?? 0,
      scoreTeam2: m.score_team2 ?? 0,
    }))
  );

  const { data: allPoolMatches } = await supabase
    .from("matches")
    .select("team1_id, team2_id, status")
    .eq("tournament_id", tournamentId)
    .eq("phase", "Poule");

  const teamPoolId = new Map(poolTeams.map((pt) => [pt.teamId, pt.poolId]));
  const completedCountByPool = new Map<number, number>();
  for (const m of allPoolMatches ?? []) {
    if (m.status !== "Termine") continue;
    const p1 = teamPoolId.get(m.team1_id);
    const p2 = teamPoolId.get(m.team2_id);
    if (p1 !== undefined && p1 === p2) {
      completedCountByPool.set(p1, (completedCountByPool.get(p1) ?? 0) + 1);
    }
  }

  return computeQualification(standings, pools ?? [], completedCountByPool);
}

export async function createMatchAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaffAuth("admin");

  const input: CreateMatchInput = {
    tournamentId: Number(formData.get("tournament_id") ?? 0),
    team1Id: Number(formData.get("team1_id") ?? 0),
    team2Id: Number(formData.get("team2_id") ?? 0),
    matchDate: String(formData.get("match_date") ?? ""),
    matchTime: String(formData.get("match_time") ?? "00:00:00").trim() || "00:00:00",
    status: (String(formData.get("status") ?? "Programme") as MatchStatus),
    phase: (String(formData.get("phase") ?? "Poule") as MatchPhase),
  };

  const supabase = await getSupabaseServerClient();
  const context = await buildCreateMatchContext(supabase, input.tournamentId, input.team1Id, input.team2Id, input.phase);
  const validation = validateMatchCreation(input, context);

  if (!validation.ok) {
    return { ok: false, message: validation.error };
  }

  const { scoreTeam1, scoreTeam2 } = initialScoresForStatus(input.status);
  const trialTemplate = trialTemplateForPhase(input.phase);

  const { data: match, error } = await supabase
    .from("matches")
    .insert({
      tournament_id: input.tournamentId,
      team1_id: input.team1Id,
      team2_id: input.team2Id,
      match_date: input.matchDate,
      match_time: input.matchTime,
      status: input.status,
      phase: input.phase,
      trial_template: trialTemplate,
      score_team1: scoreTeam1,
      score_team2: scoreTeam2,
      published: true,
    })
    .select("id")
    .single();

  if (error || !match) {
    return { ok: false, message: "Création du match impossible." };
  }

  const trials = trialsForTemplate(trialTemplate);
  const { error: trialsError } = await supabase.from("match_trials").insert(
    trials.map((t) => ({
      match_id: match.id,
      trial_order: t.order,
      trial_name: t.name,
      team1_points: 0,
      team2_points: 0,
    }))
  );

  if (trialsError) {
    return { ok: false, message: "Match créé, mais l'initialisation des épreuves a échoué." };
  }

  revalidatePath("/matches/create");
  revalidatePath("/dashboard");
  return { ok: true, message: `Match créé avec succès (#${match.id}).` };
}
