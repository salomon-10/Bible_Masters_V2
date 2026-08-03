import { resolveTeamLogoUrl, type MatchChangeLog, type MatchWithTeams, type Pool, type Team, type Tournament } from "@bible-masters/shared";
import { getSupabaseServerClient } from "./supabase-server";
import { env } from "./env";

function toTournament(row: any): Tournament {
  return { id: row.id, name: row.name, isActive: row.is_active, createdAt: row.created_at };
}

function toTeam(row: any, poolId: number | null = null, poolName: string | null = null): Team {
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    name: row.name,
    logoUrl: resolveTeamLogoUrl(env.supabaseUrl, row.logo_path),
    poolId,
    poolName,
  };
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

export async function fetchTeams(tournamentId: number): Promise<Team[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("teams").select("*").eq("tournament_id", tournamentId).order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => toTeam(row));
}

/** Équipes non affectées à une poule (porté depuis fetchUnassignedTeams()). */
export async function fetchUnassignedTeams(tournamentId: number): Promise<Team[]> {
  const supabase = await getSupabaseServerClient();
  const { data: assigned } = await supabase
    .from("pool_teams")
    .select("team_id, pool:pools!inner(tournament_id)")
    .eq("pool.tournament_id", tournamentId);

  const assignedIds = new Set((assigned ?? []).map((r) => r.team_id));
  const teams = await fetchTeams(tournamentId);
  return teams.filter((t) => !assignedIds.has(t.id));
}

export async function fetchPools(tournamentId: number): Promise<Pool[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("pools").select("*").eq("tournament_id", tournamentId).order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ id: row.id, tournamentId: row.tournament_id, name: row.name }));
}

export async function fetchTeamsGroupedByPool(tournamentId: number): Promise<Record<string, Team[]>> {
  const pools = await fetchPools(tournamentId);
  const supabase = await getSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("pool_teams")
    .select("pool_id, team:teams(*)")
    .in("pool_id", pools.map((p) => p.id));
  if (error) throw new Error(error.message);

  const poolNameById = new Map(pools.map((p) => [p.id, p.name]));
  const grouped: Record<string, Team[]> = {};
  for (const pool of pools) grouped[pool.name] = [];

  for (const row of rows ?? []) {
    const team = row.team as any;
    if (!team) continue;
    const poolName = poolNameById.get(row.pool_id) ?? "Sans poule";
    grouped[poolName] = grouped[poolName] ?? [];
    grouped[poolName].push(toTeam(team, row.pool_id, poolName));
  }

  return grouped;
}

export async function fetchMatches(tournamentId: number): Promise<MatchWithTeams[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("matches")
    .select("*, team1:teams!matches_team1_id_fkey(name, logo_path), team2:teams!matches_team2_id_fkey(name, logo_path)")
    .eq("tournament_id", tournamentId)
    .order("id", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toMatchWithTeams);
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

export async function fetchMatchChangeLogs(matchId: number, limit = 120): Promise<MatchChangeLog[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("match_change_logs")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    matchId: row.match_id,
    staffUsername: row.staff_username,
    action: row.action,
    oldStatus: row.old_status,
    newStatus: row.new_status,
    oldScoreTeam1: row.old_score_team1,
    newScoreTeam1: row.new_score_team1,
    oldScoreTeam2: row.old_score_team2,
    newScoreTeam2: row.new_score_team2,
    oldPublished: row.old_published,
    newPublished: row.new_published,
    createdAt: row.created_at,
  }));
}
