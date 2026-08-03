import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@bible-masters/shared";
import { env } from "./env";

/**
 * Client Supabase pour Server Components / Route Handlers.
 * L'app publique n'a pas de session utilisateur (pas d'auth ici), mais on
 * garde la même primitive que l'app admin pour rester cohérent et profiter
 * du cache de session Supabase si un jour un espace "favoris" authentifié
 * est ajouté côté public.
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
          // Appelé depuis un Server Component : les cookies ne peuvent pas être
          // modifiés ici, ce n'est pas un problème car l'app publique n'a pas
          // besoin d'écrire de cookies de session.
        }
      },
    }
  );
}
