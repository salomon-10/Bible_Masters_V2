# Bible Masters — Next.js + Supabase

Migration complète de l'application PHP/MySQL originale vers Next.js 15 (App
Router) + TypeScript + Supabase (Postgres, Auth, Storage, Realtime), déployée
en deux apps distinctes sur Vercel.

## 1. Architecture

```
bible-masters/
├── apps/
│   ├── public/     # Site public (résultats, direct, classements) — domaine public
│   └── admin/      # Back-office (staff : admin + arbitre) — domaine séparé
├── packages/
│   └── shared/     # Types, logique métier (règles de tournoi), clients Supabase
└── supabase/
    └── migrations/ # Schéma SQL, RLS, Storage, Realtime
```

**Pourquoi deux apps séparées plutôt qu'une seule avec des route groups ?**
Le site public et le back-office sont destinés à deux domaines différents.
Deux apps Next.js indépendantes permettent : un déploiement Vercel séparé par
domaine, un cache/ISR agressif côté public (données publiques, forte
audience) sans impacter le rendu toujours dynamique du back-office, et une
isolation claire des permissions (le bundle public n'embarque jamais de code
lié à l'authentification staff). Les deux apps partagent `packages/shared`
pour éviter toute duplication de la logique métier et des types.

## 2. Ce qui a changé par rapport à l'app PHP

| PHP (avant) | Next.js + Supabase (après) |
|---|---|
| Sessions PHP (`$_SESSION`) + table `admins` | Supabase Auth + table `staff_roles` (rôle applicatif) |
| MySQL, identifiants en clair dans `config/database.php` | Postgres Supabase, clés dans variables d'environnement (jamais committées) |
| Logos en BLOB SQL (`logo_blob`) | Fichiers dans Supabase Storage (bucket `team-logos`) |
| "Direct" = polling HTML (`setInterval` + refetch de la page) | Abonnement Supabase Realtime (push instantané) |
| CSRF token maison | Server Actions Next.js (protection CSRF native basée sur l'origine) + cookies `SameSite` |
| Mots de passe arbitre par défaut committés dans une migration SQL | Aucun mot de passe par défaut : chaque compte est créé explicitement via `scripts/create-staff-user.mjs` |
| Logique métier mêlée au HTML dans les fichiers `.php` | Logique métier isolée et testable dans `packages/shared/src/business/*` |

Toutes les règles métier (calcul des classements, qualification aux
demi-finales, contraintes de création de match par phase, machine à états du
scoring, verrouillage des scores hors match "En cours", audit trail des
changements) ont été portées à l'identique — voir les commentaires en tête de
chaque fichier dans `packages/shared/src/business/` qui référencent la
fonction PHP d'origine.

## 3. Prérequis

- Node.js 20+
- Un projet Supabase (gratuit ou payant)
- Un compte Vercel (pour le déploiement)

## 4. Installation

```bash
npm install
```

## 5. Configuration Supabase

### 5.1 Appliquer les migrations

Avec la [Supabase CLI](https://supabase.com/docs/guides/cli) :

```bash
supabase link --project-ref <votre-project-ref>
supabase db push
```

Ou en collant le contenu de chaque fichier de `supabase/migrations/` (dans
l'ordre numérique) dans l'éditeur SQL du dashboard Supabase.

Les migrations créent : le schéma (tables, enums, contraintes), les policies
RLS (miroir exact des permissions admin/arbitre/public de l'app PHP), le
bucket Storage `team-logos`, et l'activation de Realtime sur `matches` /
`match_trials`.

### 5.2 Importer vos données existantes

Comme convenu, l'export/import des données de production MySQL vers Postgres
est géré de votre côté. Le schéma cible (`supabase/migrations/0001_schema.sql`)
utilise des colonnes `bigint identity` pour les clés primaires : lors de
l'import, pensez à réinitialiser les séquences après un import avec ID
explicites, par exemple :

```sql
select setval(pg_get_serial_sequence('teams', 'id'), (select max(id) from teams));
```

(à répéter pour `tournaments`, `pools`, `pool_teams`, `matches`,
`match_trials`, `match_change_logs`).

### 5.3 Créer les comptes staff (admin / arbitre)

Aucun mot de passe n'est pré-rempli. Créez chaque compte explicitement :

```bash
SUPABASE_URL=https://xxxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<clé service_role> \
node scripts/create-staff-user.mjs --email admin@bible-masters.org --password "un-mot-de-passe-fort" --username admin1 --role admin

SUPABASE_URL=https://xxxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<clé service_role> \
node scripts/create-staff-user.mjs --email arbitre1@bible-masters.org --password "un-autre-mot-de-passe" --username arbitre1 --role arbitre
```

## 6. Variables d'environnement

Copiez les fichiers d'exemple :

```bash
cp apps/public/.env.example apps/public/.env.local
cp apps/admin/.env.example apps/admin/.env.local
```

Renseignez, pour chaque app :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Et pour `apps/admin` uniquement (jamais côté public) :
- `SUPABASE_SERVICE_ROLE_KEY` — utilisée uniquement côté serveur, requise par
  `lib/supabase-service.ts` (opérations d'administration).

## 7. Lancer en local

```bash
npm run dev:public   # http://localhost:3000
npm run dev:admin    # http://localhost:3001
```

## 8. Vérifications

```bash
npm run typecheck   # tsc --noEmit sur shared + les deux apps
npm run build:public
npm run build:admin
```

## 9. Déploiement sur Vercel

Créez **deux projets Vercel** à partir du même dépôt Git :

1. **Projet "public"**
   - Root Directory : `apps/public`
   - Framework : Next.js (auto-détecté)
   - Variables d'environnement : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Domaine : votre domaine public (ex. `bible-masters.org`)

2. **Projet "admin"**
   - Root Directory : `apps/admin`
   - Framework : Next.js (auto-détecté)
   - Variables d'environnement : les mêmes + `SUPABASE_SERVICE_ROLE_KEY` (⚠️
     à ajouter uniquement en tant que variable serveur, jamais `NEXT_PUBLIC_`)
   - Domaine : un sous-domaine ou domaine séparé (ex. `admin.bible-masters.org`)

Vercel construit chaque projet indépendamment grâce à son `Root Directory` ;
npm workspaces résout `@bible-masters/shared` automatiquement au moment du
build (pas d'étape de publication séparée nécessaire).

Dans Supabase, ajoutez les deux domaines Vercel (public et admin) à la liste
des **Redirect URLs** autorisées (Authentication > URL Configuration), même
si l'app publique n'utilise pas l'authentification.

## 10. Sécurité — points corrigés par rapport à l'app PHP d'origine

- Plus aucun identifiant de base de données en clair dans le code source.
- Plus aucun mot de passe par défaut committé dans une migration.
- RLS Postgres appliquée à toutes les tables : même une clé anonyme exposée
  publiquement ne permet ni lecture des matchs non publiés, ni écriture.
- La clé `service_role` (qui bypass RLS) n'est utilisée que côté serveur,
  dans `apps/admin/lib/supabase-service.ts` (marqué `server-only`) et dans le
  script de bootstrap des comptes staff — jamais exposée au navigateur.

## 11. Limites connues / suite possible

- Le "mode legacy sans poule" (`poolCount === 0`) autorisant la création
  libre de matchs de phase "Poule" est conservé pour fidélité avec la
  fonction `createMatch()` d'origine ; à retirer si votre usage réel crée
  toujours des poules avant les matchs.
- Aucun test automatisé n'est fourni pour l'instant : la logique métier dans
  `packages/shared/src/business/` est pure et sans dépendance à Supabase,
  donc directement testable avec le test runner de votre choix (vitest,
  jest...).
