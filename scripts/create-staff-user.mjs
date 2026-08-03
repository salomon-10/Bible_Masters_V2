#!/usr/bin/env node
/**
 * Crée (ou met à jour) un compte staff (admin ou arbitre).
 *
 * Remplace le seed en dur des comptes arbitre dans les migrations MySQL
 * d'origine — ici, chaque compte est créé explicitement via Supabase Auth,
 * avec un mot de passe choisi par l'opérateur (aucun mot de passe par défaut
 * n'est jamais committé dans le dépôt).
 *
 * Usage :
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/create-staff-user.mjs --email admin@example.com --password "motdepasse-fort" --username admin1 --role admin
 *
 * Variables d'env acceptées : SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_URL.
 */

import { createClient } from "@supabase/supabase-js";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      args[key] = value;
      i += 1;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error("Erreur : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (variables d'environnement).");
    process.exit(1);
  }

  let { email, password, username, role } = args;

  if (!username || !password || !role) {
    console.error("Usage : node scripts/create-staff-user.mjs --username <pseudo> --password <motdepasse> --role <admin|arbitre> [--email <email>]");
    process.exit(1);
  }

  if (!email) {
    email = `${username}@biblemasters.local`;
  }

  if (!["admin", "arbitre"].includes(role)) {
    console.error("Erreur : --role doit être 'admin' ou 'arbitre'.");
    process.exit(1);
  }

  if (password.length < 7) {
    console.error("Erreur : le mot de passe doit contenir au moins 7 caractères.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  let userId = created?.user?.id;

  if (createError) {
    if (createError.message.toLowerCase().includes("already been registered") || createError.status === 422) {
      const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error("Erreur lors de la recherche de l'utilisateur existant :", listError.message);
        process.exit(1);
      }
      const existing = listData.users.find((u) => u.email === email);
      if (!existing) {
        console.error("Erreur : utilisateur introuvable après échec de création.");
        process.exit(1);
      }
      userId = existing.id;
    } else {
      console.error("Erreur lors de la création du compte Auth :", createError.message);
      process.exit(1);
    }
  }

  const { error: upsertError } = await supabase
    .from("staff_roles")
    .upsert({ user_id: userId, username, role }, { onConflict: "user_id" });

  if (upsertError) {
    console.error("Erreur lors de l'attribution du rôle staff :", upsertError.message);
    process.exit(1);
  }

  console.log(`Compte staff prêt : ${email} (${username}) — rôle "${role}".`);
}

main();
