import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, MatchStatus, StaffSession } from "@bible-masters/shared";

export interface MatchStateDiff {
  oldStatus: MatchStatus | null;
  newStatus: MatchStatus | null;
  oldScoreTeam1: number | null;
  newScoreTeam1: number | null;
  oldScoreTeam2: number | null;
  newScoreTeam2: number | null;
  oldPublished: boolean | null;
  newPublished: boolean | null;
}

/** Porté depuis updateMatchState() : trace chaque changement de statut/score/visibilité. */
export async function logMatchChange(
  supabase: SupabaseClient<Database>,
  matchId: number,
  staff: StaffSession,
  diff: MatchStateDiff,
  action = "update_match_state"
): Promise<void> {
  await supabase.from("match_change_logs").insert({
    match_id: matchId,
    staff_user_id: staff.userId,
    staff_username: staff.username,
    action,
    old_status: diff.oldStatus,
    new_status: diff.newStatus,
    old_score_team1: diff.oldScoreTeam1,
    new_score_team1: diff.newScoreTeam1,
    old_score_team2: diff.oldScoreTeam2,
    new_score_team2: diff.newScoreTeam2,
    old_published: diff.oldPublished,
    new_published: diff.newPublished,
  });
}
