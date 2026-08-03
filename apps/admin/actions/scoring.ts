"use server";

import { revalidatePath } from "next/cache";
import { canEditTrial, canEndMatch, canStartMatch, computeMatchTotalsFromTrials } from "@bible-masters/shared";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { requireStaffAuth } from "@/lib/auth";
import { logMatchChange } from "./_logs";
import type { ActionState } from "./tournaments";

/** Porté depuis admin/set_score.php (action "start_match" + resetMatchTrialsAndTotals). */
export async function startMatchAction(matchId: number): Promise<ActionState> {
  const staff = await requireStaffAuth(["admin", "arbitre"]);
  const supabase = await getSupabaseServerClient();

  const { data: match } = await supabase.from("matches").select("status, published").eq("id", matchId).maybeSingle();
  if (!match) return { ok: false, message: "Match introuvable." };

  const check = canStartMatch(match.status);
  if (!check.ok) return { ok: false, message: check.error };

  await supabase.from("match_trials").update({ team1_points: 0, team2_points: 0 }).eq("match_id", matchId);
  await supabase.from("matches").update({ score_team1: 0, score_team2: 0 }).eq("id", matchId);

  const { error } = await supabase.from("matches").update({ status: "En cours" }).eq("id", matchId);
  if (error) return { ok: false, message: "Impossible de démarrer le match." };

  await logMatchChange(supabase, matchId, staff, {
    oldStatus: match.status,
    newStatus: "En cours",
    oldScoreTeam1: null,
    newScoreTeam1: 0,
    oldScoreTeam2: null,
    newScoreTeam2: 0,
    oldPublished: match.published,
    newPublished: match.published,
  });

  revalidatePath(`/matches/${matchId}/score`);
  return { ok: true, message: "Match démarré." };
}

/** Porté depuis admin/set_score.php (action "end_match"). */
export async function endMatchAction(matchId: number): Promise<ActionState> {
  const staff = await requireStaffAuth(["admin", "arbitre"]);
  const supabase = await getSupabaseServerClient();

  const { data: match } = await supabase.from("matches").select("status, score_team1, score_team2, published").eq("id", matchId).maybeSingle();
  if (!match) return { ok: false, message: "Match introuvable." };

  const check = canEndMatch(match.status);
  if (!check.ok) return { ok: false, message: check.error };

  const { data: trials } = await supabase.from("match_trials").select("team1_points, team2_points").eq("match_id", matchId);
  const totals = computeMatchTotalsFromTrials(
    (trials ?? []).map((t) => ({ team1Points: t.team1_points, team2Points: t.team2_points }))
  );

  const { error } = await supabase
    .from("matches")
    .update({ status: "Termine", score_team1: totals.team1, score_team2: totals.team2 })
    .eq("id", matchId);

  if (error) return { ok: false, message: "Impossible de finaliser ce match." };

  await logMatchChange(supabase, matchId, staff, {
    oldStatus: match.status,
    newStatus: "Termine",
    oldScoreTeam1: match.score_team1,
    newScoreTeam1: totals.team1,
    oldScoreTeam2: match.score_team2,
    newScoreTeam2: totals.team2,
    oldPublished: match.published,
    newPublished: match.published,
  });

  revalidatePath(`/matches/${matchId}/score`);
  return { ok: true, message: "Match terminé." };
}

/**
 * Porté depuis admin/set_score.php (actions "autosave_trial"/"save_trial").
 * Utilisé par le composant client TrialEditor avec un debounce, ce qui
 * reproduit le comportement d'autosave AJAX du PHP.
 */
export async function saveTrialAction(
  matchId: number,
  trialOrder: number,
  team1Points: number,
  team2Points: number
): Promise<ActionState> {
  await requireStaffAuth(["admin", "arbitre"]);
  const supabase = await getSupabaseServerClient();

  const { data: match } = await supabase.from("matches").select("status").eq("id", matchId).maybeSingle();
  if (!match) return { ok: false, message: "Match introuvable." };

  const check = canEditTrial(match.status, trialOrder, team1Points, team2Points);
  if (!check.ok) return { ok: false, message: check.error };

  const { error: updateError, count } = await supabase
    .from("match_trials")
    .update({ team1_points: team1Points, team2_points: team2Points }, { count: "exact" })
    .eq("match_id", matchId)
    .eq("trial_order", trialOrder);

  if (updateError || !count) {
    return { ok: false, message: "Épreuve introuvable." };
  }

  const { data: trials } = await supabase.from("match_trials").select("team1_points, team2_points").eq("match_id", matchId);
  const totals = computeMatchTotalsFromTrials(
    (trials ?? []).map((t) => ({ team1Points: t.team1_points, team2Points: t.team2_points }))
  );

  await supabase.from("matches").update({ score_team1: totals.team1, score_team2: totals.team2 }).eq("id", matchId);

  return { ok: true, message: "Épreuve enregistrée." };
}
