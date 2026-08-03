import "server-only";
import { redirect } from "next/navigation";
import type { StaffRole, StaffSession } from "@bible-masters/shared";
import { getSupabaseServerClient } from "./supabase-server";

/**
 * Résout la session staff courante (utilisateur Supabase Auth + rôle métier
 * dans staff_roles). Remplace $_SESSION['admin_id']/['admin_username']/['admin_role'].
 */
export async function getStaffSession(): Promise<StaffSession | null> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: staffRow } = await supabase.from("staff_roles").select("username, role").eq("user_id", user.id).maybeSingle();

  // Grâce à la policy staff_roles_self_read (RLS), un utilisateur ne peut lire
  // que sa propre ligne. Si aucune ligne n'existe, ce n'est pas un compte staff.
  if (!staffRow) return null;

  return { userId: user.id, username: staffRow.username, role: staffRow.role as StaffRole };
}

export function redirectAfterLoginForRole(role: StaffRole): string {
  // Porté depuis admin/includes/auth.php::redirectAfterLoginForRole()
  return role === "arbitre" ? "/visibilite" : "/dashboard";
}

/**
 * Porté depuis admin/includes/auth.php::requireAdminAuth().
 * À appeler en tête de chaque Server Component de page protégée.
 */
export async function requireStaffAuth(allowedRoles?: StaffRole | StaffRole[]): Promise<StaffSession> {
  const session = await getStaffSession();

  if (!session) {
    redirect("/login");
  }

  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(session.role)) {
      redirect(redirectAfterLoginForRole(session.role));
    }
  }

  return session;
}
