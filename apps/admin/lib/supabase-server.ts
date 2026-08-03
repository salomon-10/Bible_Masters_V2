import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@bible-masters/shared";
import { env } from "./env";

/**
 * Client Supabase pour Server Components / Server Actions de l'app admin.
 * Porte la session utilisateur (cookies) — remplace les sessions PHP
 * ($_SESSION['admin_id']/['admin_role']) par une session Supabase Auth.
 */
export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    { url: env.supabaseUrl, anonKey: env.supabaseAnonKey },
    {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appelé depuis un Server Component sans pouvoir écrire de cookies :
          // sans incidence, le middleware se charge du rafraîchissement de session.
        }
      },
    }
  );
}
