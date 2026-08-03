"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { requireStaffAuth } from "@/lib/auth";

export interface ActionState {
  ok: boolean;
  message: string;
}

export async function createTournamentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaffAuth("admin");
  const name = String(formData.get("tournament_name") ?? "").trim();

  if (name === "") {
    return { ok: false, message: "Le nom du tournoi est obligatoire." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("tournaments").insert({ name });

  if (error) {
    return { ok: false, message: error.code === "23505" ? "Un tournoi avec ce nom existe déjà." : "Création du tournoi impossible." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "Tournoi créé avec succès." };
}

export async function deleteTournamentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaffAuth("admin");
  const tournamentId = Number(formData.get("tournament_id") ?? 0);

  if (!tournamentId || tournamentId <= 0) {
    return { ok: false, message: "Tournoi invalide." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("tournaments").delete().eq("id", tournamentId);

  if (error) {
    return { ok: false, message: "Suppression du tournoi impossible." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "Tournoi supprimé avec succès." };
}
