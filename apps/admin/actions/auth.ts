"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { redirectAfterLoginForRole } from "@/lib/auth";
import type { StaffRole } from "@bible-masters/shared";

export interface LoginState {
  error: string | null;
}

/**
 * Porté depuis admin/login.php.
 * Le throttling anti brute-force est délégué à Supabase Auth (GoTrue), qui
 * applique nativement une limite de tentatives par IP/utilisateur — cela
 * remplace le compteur en session PHP (isLoginThrottled/registerLoginFailure).
 */
export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (email === "" || password === "") {
    return { error: "Veuillez renseigner tous les champs." };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "Identifiants invalides." };
  }

  const { data: staffRow } = await supabase
    .from("staff_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!staffRow) {
    await supabase.auth.signOut();
    return { error: "Ce compte n'a pas accès au back-office." };
  }

  redirect(redirectAfterLoginForRole(staffRow.role as StaffRole));
}

/** Porté depuis admin/logout.php. */
export async function logoutAction(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
