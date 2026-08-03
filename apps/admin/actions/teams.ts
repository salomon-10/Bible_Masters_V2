"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { validateLogoUpload, TEAM_LOGO_BUCKET } from "@bible-masters/shared";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { requireStaffAuth } from "@/lib/auth";
import type { ActionState } from "./tournaments";

export async function createTeamAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaffAuth("admin");

  const tournamentId = Number(formData.get("selected_tournament_id") ?? 0);
  const teamName = String(formData.get("team_name") ?? "").trim();
  const logoFile = formData.get("team_logo");

  if (tournamentId <= 0) return { ok: false, message: "Sélectionnez d'abord un tournoi." };
  if (teamName === "") return { ok: false, message: "Le nom de l'équipe est obligatoire." };

  const supabase = await getSupabaseServerClient();
  let logoPath: string | null = null;

  if (logoFile instanceof File && logoFile.size > 0) {
    const validation = validateLogoUpload(logoFile.type, logoFile.size);
    if (!validation.ok) {
      return { ok: false, message: validation.error ?? "Logo invalide." };
    }

    const objectPath = `${tournamentId}/${randomUUID()}.${validation.extension}`;
    const { error: uploadError } = await supabase.storage.from(TEAM_LOGO_BUCKET).upload(objectPath, logoFile, {
      contentType: logoFile.type,
      upsert: false,
    });

    if (uploadError) {
      return { ok: false, message: "Le logo n'a pas pu être enregistré. Vérifiez le format et la taille, puis réessayez." };
    }

    logoPath = objectPath;
  }

  const { error } = await supabase.from("teams").insert({ tournament_id: tournamentId, name: teamName, logo_path: logoPath });

  if (error) {
    if (logoPath) {
      await supabase.storage.from(TEAM_LOGO_BUCKET).remove([logoPath]);
    }
    return { ok: false, message: error.code === "23505" ? "Une équipe avec ce nom existe déjà dans ce tournoi." : "Création équipe impossible." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "Équipe créée avec succès." };
}

export async function deleteTeamAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaffAuth("admin");

  const teamId = Number(formData.get("team_id") ?? 0);
  const tournamentId = Number(formData.get("selected_tournament_id") ?? 0);

  if (teamId <= 0 || tournamentId <= 0) {
    return { ok: false, message: "Équipe invalide." };
  }

  const supabase = await getSupabaseServerClient();

  const { data: team } = await supabase.from("teams").select("logo_path").eq("id", teamId).maybeSingle();

  const { error } = await supabase.from("teams").delete().eq("id", teamId).eq("tournament_id", tournamentId);

  if (error) {
    return { ok: false, message: "Suppression équipe impossible (l'équipe est peut-être engagée dans un match)." };
  }

  if (team?.logo_path) {
    await supabase.storage.from(TEAM_LOGO_BUCKET).remove([team.logo_path]);
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "Équipe supprimée avec succès." };
}
