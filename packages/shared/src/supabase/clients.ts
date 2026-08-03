import { createBrowserClient, createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

function requireEnv(env: Partial<SupabaseEnv>): SupabaseEnv {
  if (!env.url || !env.anonKey) {
    throw new Error(
      "Configuration Supabase manquante : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requis."
    );
  }
  return { url: env.url, anonKey: env.anonKey };
}

/**
 * Client Supabase pour les Client Components (navigateur).
 * Respecte les policies RLS "anon"/"authenticated" selon la session.
 */
export function createSupabaseBrowserClient(env: Partial<SupabaseEnv>) {
  const { url, anonKey } = requireEnv(env);
  return createBrowserClient<Database>(url, anonKey);
}

/**
 * Client Supabase pour les Server Components / Route Handlers / Server Actions.
 * `cookies` est l'adaptateur cookie de Next.js (voir lib/supabase-server.ts
 * dans chaque app), injecté ici pour éviter de dupliquer cette fonction.
 */
export function createSupabaseServerClient(env: Partial<SupabaseEnv>, cookieMethods: CookieMethodsServer) {
  const { url, anonKey } = requireEnv(env);
  return createServerClient<Database>(url, anonKey, {
    cookies: cookieMethods,
  });
}

/**
 * Client "service role" — bypass RLS. Réservé aux opérations serveur qui
 * doivent lire/écrire staff_roles (gestion des comptes admin/arbitre), ce que
 * même un utilisateur admin authentifié ne peut pas faire via RLS (par
 * design : cf. supabase/migrations/0002_rls.sql). Ne JAMAIS exposer
 * SUPABASE_SERVICE_ROLE_KEY côté client.
 */
export function createSupabaseServiceRoleClient(url: string, serviceRoleKey: string) {
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY et NEXT_PUBLIC_SUPABASE_URL sont requis côté serveur.");
  }
  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export type { Database };
