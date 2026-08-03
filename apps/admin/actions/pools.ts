"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { requireStaffAuth } from "@/lib/auth";
import type { ActionState } from "./tournaments";

export async function createPoolAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaffAuth("admin");

  const tournamentId = Number(formData.get("selected_tournament_id") ?? 0);
  const poolName = String(formData.get("pool_name") ?? "").trim();

  if (tournamentId <= 0 || poolName === "") {
    return { ok: false, message: "Sélection tournoi et nom de poule requis." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("pools").insert({ tournament_id: tournamentId, name: poolName });

  if (error) {
    return { ok: false, message: error.code === "23505" ? "Une poule avec ce nom existe déjà." : "Création poule impossible." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "Poule créée avec succès." };
}

/** Une équipe ne peut appartenir qu'à une seule poule (contrainte uq_pool_teams_team_id). */
export async function attachTeamToPoolAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaffAuth("admin");

  const poolId = Number(formData.get("pool_id") ?? 0);
  const teamId = Number(formData.get("team_id") ?? 0);

  if (poolId <= 0 || teamId <= 0) {
    return { ok: false, message: "Sélection de poule/équipe invalide." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("pool_teams").insert({ pool_id: poolId, team_id: teamId });

  if (error) {
    return { ok: false, message: "Affectation impossible : une équipe ne peut appartenir qu'à une seule poule." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "Équipe affectée à la poule." };
}
