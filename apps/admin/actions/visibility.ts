"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { requireStaffAuth } from "@/lib/auth";
import { logMatchChange } from "./_logs";
import type { ActionState } from "./tournaments";
import type { MatchStatus } from "@bible-masters/shared";

const ALLOWED_STATUSES: MatchStatus[] = ["Programme", "En cours", "Termine"];

/** Porté depuis admin/visibilite.php. */
export async function updateMatchVisibilityAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const staff = await requireStaffAuth(["admin", "arbitre"]);

  const matchId = Number(formData.get("match_id") ?? 0);
  const status = String(formData.get("status") ?? "Programme") as MatchStatus;
  const published = String(formData.get("published") ?? "0") === "1";

  if (matchId <= 0) return { ok: false, message: "Match invalide." };
  if (!ALLOWED_STATUSES.includes(status)) return { ok: false, message: "Statut invalide." };

  const supabase = await getSupabaseServerClient();
  const { data: current } = await supabase
    .from("matches")
    .select("status, score_team1, score_team2, published")
    .eq("id", matchId)
    .maybeSingle();

  if (!current) return { ok: false, message: "Match introuvable." };

  const { error } = await supabase.from("matches").update({ status, published }).eq("id", matchId);
  if (error) return { ok: false, message: "Mise à jour impossible." };

  await logMatchChange(supabase, matchId, staff, {
    oldStatus: current.status,
    newStatus: status,
    oldScoreTeam1: current.score_team1,
    newScoreTeam1: current.score_team1,
    oldScoreTeam2: current.score_team2,
    newScoreTeam2: current.score_team2,
    oldPublished: current.published,
    newPublished: published,
  });

  revalidatePath("/visibilite");
  return { ok: true, message: "Statut/visibilité mis à jour." };
}
