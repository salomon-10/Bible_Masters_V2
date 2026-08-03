import "server-only";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { StaffRole, StaffSession } from "@bible-masters/shared";
import { getSupabaseServerClient } from "./supabase-server";

/**
 * Résout la session staff courante (utilisateur Supabase Auth + rôle métier
 * dans staff_roles, ou session locale).
 */
export async function getStaffSession(): Promise<StaffSession | null> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: staffRow } = await supabase
      .from("staff_roles")
      .select("username, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (staffRow) {
      return { userId: user.id, username: staffRow.username, role: staffRow.role as StaffRole };
    }
  }

  // Session fallback pour environnement de dev / sans Supabase direct
  try {
    const cookieStore = await cookies();
    const mockCookie = cookieStore.get("bm_mock_staff_user");
    if (mockCookie?.value) {
      const parsed = JSON.parse(mockCookie.value);
      if (parsed.username && parsed.role) {
        return {
          userId: "mock-id",
          username: parsed.username,
          role: parsed.role as StaffRole,
        };
      }
    }
  } catch {
    // Ignore error
  }

  return null;
}

export function redirectAfterLoginForRole(role: StaffRole): string {
  return role === "arbitre" ? "/visibilite" : "/dashboard";
}

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
