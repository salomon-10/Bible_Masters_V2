#!/usr/bin/env node
/**
 * Upload les logos d'équipes extraits du dump MySQL (supabase/seed/logos/*)
 * vers le bucket Supabase Storage "team-logos", au chemin déjà référencé par
 * supabase/seed/01_data.sql (teams.logo_path = "<tournament_id>/<team_id>.<ext>").
 *
 * Usage :
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload-legacy-logos.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

const SEED_DIR = new URL("../supabase/seed/logos/", import.meta.url).pathname;
const BUCKET = "team-logos";

// Doit rester synchronisé avec supabase/seed/01_data.sql (teams.tournament_id = 10).
const TOURNAMENT_ID = 10;

const MIME_BY_EXT = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

async function main() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error("Erreur : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const files = readdirSync(SEED_DIR).filter((f) => Object.keys(MIME_BY_EXT).includes(extname(f).toLowerCase()));

  if (files.length === 0) {
    console.log("Aucun logo à uploader dans supabase/seed/logos/.");
    return;
  }

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    const contentType = MIME_BY_EXT[ext];
    const objectPath = `${TOURNAMENT_ID}/${file}`;
    const buffer = readFileSync(join(SEED_DIR, file));

    const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buffer, {
      contentType,
      upsert: true,
    });

    if (error) {
      console.error(`Échec upload ${objectPath} :`, error.message);
    } else {
      console.log(`OK  ${objectPath} (${buffer.length} octets)`);
    }
  }
}

main();
