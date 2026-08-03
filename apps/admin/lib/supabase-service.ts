import "server-only";
import { createSupabaseServiceRoleClient } from "@bible-masters/shared";
import { env } from "./env";

/**
 * Client "service role", bypass RLS. Réservé à des opérations serveur très
 * précises (lecture du rôle d'un utilisateur juste après connexion, avant que
 * sa session ait pu être établie côté RLS). Le mot-clé `server-only` empêche
 * toute importation accidentelle depuis un Client Component.
 */
export function getSupabaseServiceRoleClient() {
  return createSupabaseServiceRoleClient(env.supabaseUrl, env.supabaseServiceRoleKey);
}
