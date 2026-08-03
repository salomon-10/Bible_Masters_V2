import {
  computePoolStandings,
  computeQualification,
  resolveTeamLogoUrl,
  type MatchWithTeams,
  type Pool,
  type PoolStandings,
  type QualificationResult,
  type Team,
  type Tournament,
} from "@bible-masters/shared";
import { getSupabaseServerClient } from "./supabase-server";
import { env } from "./env";

function toTournament(row: { id: number; name: string; is_active: boolean; created_at: string }): Tournament {
  return { id: row.id, name: row.name, isActive: row.is_active, createdAt: row.created_at };
}

function toMatchWithTeams(row: any): MatchWithTeams {
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    team1Id: row.team1_id,
    team2Id: row.team2_id,
    team1Name: row.team1?.name ?? "",
    team2Name: row.team2?.name ?? "",
    team1LogoUrl: resolveTeamLogoUrl(env.supabaseUrl, row.team1?.logo_path ?? null),
    team2LogoUrl: resolveTeamLogoUrl(env.supabaseUrl, row.team2?.logo_path ?? null),
    matchDate: row.match_date,
    matchTime: row.match_time,
    status: row.status,
    phase: row.phase,
    trialTemplate: row.trial_template,
    scoreTeam1: row.score_team1,
    scoreTeam2: row.score_team2,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchTournaments(): Promise<Tournament[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("tournaments").select("*").order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toTournament);
}

/** Reproduit resolveTournamentId() : id demandé s'il existe, sinon le tournoi actif le plus récent. */
export async function resolveTournamentId(requestedId: number | null): Promise<number | null> {
  const supabase = await getSupabaseServerClient();

  if (requestedId && requestedId > 0) {
    const { data } = await supabase.from("tournaments").select("id").eq("id", requestedId).maybeSingle();
    if (data) return data.id;
  }

  const { data: active } = await supabase
    .from("tournaments")
    .select("id")
    .eq("is_active", true)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (active) return active.id;

  const { data: any } = await supabase.from("tournaments").select("id").order("id", { ascending: false }).limit(1).maybeSingle();
  return any?.id ?? null;
}

export async function fetchTournamentById(id: number): Promise<Tournament | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("tournaments").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toTournament(data) : null;
}

export interface MatchFilters {
  status?: "all" | "Programme" | "En cours" | "Termine";
  search?: string;
  matchDate?: string;
}

/** Équivalent de fetchMatches($pdo, null, true, $tournamentId) + le filtrage client de user/index.php. */
export async function fetchPublishedMatches(tournamentId: number, filters: MatchFilters = {}): Promise<MatchWithTeams[]> {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("matches")
    .select("*, team1:teams!matches_team1_id_fkey(name, logo_path), team2:teams!matches_team2_id_fkey(name, logo_path)")
    .eq("tournament_id", tournamentId)
    .eq("published", true)
    .order("match_date", { ascending: false })
    .order("match_time", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.matchDate) {
    query = query.eq("match_date", filters.matchDate);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let matches = (data ?? []).map(toMatchWithTeams);

  if (filters.search && filters.search.trim() !== "") {
    const needle = filters.search.trim().toLowerCase();
    matches = matches.filter(
      (m) => m.team1Name.toLowerCase().includes(needle) || m.team2Name.toLowerCase().includes(needle)
    );
  }

  return matches;
}

export async function fetchMatchById(matchId: number): Promise<MatchWithTeams | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("matches")
    .select("*, team1:teams!matches_team1_id_fkey(name, logo_path), team2:teams!matches_team2_id_fkey(name, logo_path)")
    .eq("id", matchId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toMatchWithTeams(data) : null;
}

export async function fetchMatchTrials(matchId: number) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("match_trials")
    .select("trial_order, trial_name, team1_points, team2_points")
    .eq("match_id", matchId)
    .order("trial_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((t) => ({
    trialOrder: t.trial_order,
    trialName: t.trial_name,
    team1Points: t.team1_points,
    team2Points: t.team2_points,
  }));
}

export async function fetchTeamsGroupedByPool(tournamentId: number): Promise<Record<string, Team[]>> {
  const supabase = await getSupabaseServerClient();
  const { data: pools, error: poolsError } = await supabase
    .from("pools")
    .select("id, name")
    .eq("tournament_id", tournamentId)
    .order("name", { ascending: true });
  if (poolsError) throw new Error(poolsError.message);

  const { data: rows, error } = await supabase
    .from("pool_teams")
    .select("pool_id, team:teams(id, tournament_id, name, logo_path)")
    .in("pool_id", (pools ?? []).map((p) => p.id));
  if (error) throw new Error(error.message);

  const grouped: Record<string, Team[]> = {};
  for (const pool of pools ?? []) {
    grouped[pool.name] = [];
  }

  const poolNameById = new Map((pools ?? []).map((p) => [p.id, p.name]));
  for (const row of rows ?? []) {
    const team = row.team as any;
    if (!team) continue;
    const poolName = poolNameById.get(row.pool_id) ?? "Sans poule";
    grouped[poolName] = grouped[poolName] ?? [];
    grouped[poolName].push({
      id: team.id,
      tournamentId: team.tournament_id,
      name: team.name,
      logoUrl: resolveTeamLogoUrl(env.supabaseUrl, team.logo_path),
      poolId: row.pool_id,
      poolName,
    });
  }

  for (const poolName of Object.keys(grouped)) {
    grouped[poolName].sort((a, b) => a.name.localeCompare(b.name));
  }

  return grouped;
}

/** Classement des poules + qualification, équivalent à fetchTournamentQualification(). */
export async function fetchTournamentQualification(tournamentId: number): Promise<QualificationResult> {
  const supabase = await getSupabaseServerClient();

  const { data: pools, error: poolsError } = await supabase
    .from("pools")
    .select("id, name")
    .eq("tournament_id", tournamentId);
  if (poolsError) throw new Error(poolsError.message);

  const { data: poolTeamRows, error: ptError } = await supabase
    .from("pool_teams")
    .select("pool_id, team:teams(id, name)")
    .in("pool_id", (pools ?? []).map((p) => p.id));
  if (ptError) throw new Error(ptError.message);

  const { data: matchRows, error: matchError } = await supabase
    .from("matches")
    .select("team1_id, team2_id, score_team1, score_team2")
    .eq("tournament_id", tournamentId)
    .eq("phase", "Poule")
    .eq("status", "Termine");
  if (matchError) throw new Error(matchError.message);

  const poolTeams = (poolTeamRows ?? []).map((r) => ({
    poolId: r.pool_id,
    teamId: (r.team as any)?.id,
    teamName: (r.team as any)?.name ?? "",
  }));

  const completedPoolMatches = (matchRows ?? []).map((m) => ({
    team1Id: m.team1_id,
    team2Id: m.team2_id,
    scoreTeam1: m.score_team1 ?? 0,
    scoreTeam2: m.score_team2 ?? 0,
  }));

  const standings: PoolStandings = computePoolStandings(pools ?? [], poolTeams, completedPoolMatches);

  // Nombre de matchs de poule (tous statuts) par poule, pour le critère "6 matchs terminés".
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

export async function fetchTournamentBracket(tournamentId: number): Promise<Record<string, MatchWithTeams[]>> {
  const supabase = await getSupabaseServerClient();
  const phases = ["Poule", "Quart", "Demi", "PetiteFinale", "Finale"] as const;
  const bracket: Record<string, MatchWithTeams[]> = {};

  for (const phase of phases) {
    const { data, error } = await supabase
      .from("matches")
      .select("*, team1:teams!matches_team1_id_fkey(name, logo_path), team2:teams!matches_team2_id_fkey(name, logo_path)")
      .eq("tournament_id", tournamentId)
      .eq("phase", phase)
      .eq("published", true);
    if (error) throw new Error(error.message);
    bracket[phase] = (data ?? []).map(toMatchWithTeams);
  }

  return bracket;
}

export const publicEnv = env;
