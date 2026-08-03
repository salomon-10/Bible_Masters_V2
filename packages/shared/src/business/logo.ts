/**
 * Résolution de l'URL publique d'un logo d'équipe.
 * Porté depuis config/repositories.php::resolveTeamLogoPath()/defaultTeamLogoPath(),
 * adapté au stockage Supabase Storage (bucket "team-logos") au lieu du BLOB SQL.
 */

export const TEAM_LOGO_BUCKET = "team-logos";
export const DEFAULT_TEAM_LOGO_PATH = "/img/default-team.svg";

export function resolveTeamLogoUrl(supabaseUrl: string, logoPath: string | null): string {
  if (!logoPath) return DEFAULT_TEAM_LOGO_PATH;
  return `${supabaseUrl}/storage/v1/object/public/${TEAM_LOGO_BUCKET}/${logoPath}`;
}

const ALLOWED_LOGO_MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024; // 2 Mo, identique à admin/dashboard.php

export interface LogoUploadValidation {
  ok: boolean;
  error?: string;
  extension?: string;
}

/** Valide un fichier de logo avant upload (type MIME + taille). */
export function validateLogoUpload(mimeType: string, sizeBytes: number): LogoUploadValidation {
  if (sizeBytes > MAX_LOGO_SIZE_BYTES) {
    return { ok: false, error: "Fichier trop volumineux (max 2MB)." };
  }
  const extension = ALLOWED_LOGO_MIME_TO_EXT[mimeType];
  if (!extension) {
    return { ok: false, error: "Format de logo non supporté (PNG, JPG ou WEBP uniquement)." };
  }
  return { ok: true, extension };
}
