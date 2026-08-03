-- Bible Masters — schema initial (Postgres / Supabase)
-- Converti fidèlement depuis database/schema.sql + database/migrations/*.sql (MySQL)
-- Enums, contraintes et règles métier explicites sont conservés.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums (Sécurisés avec vérification d'existence pour ré-exécution sans erreur 42710)
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'staff_role') then
    create type staff_role as enum ('admin', 'arbitre');
  end if;

  if not exists (select 1 from pg_type where typname = 'match_status') then
    create type match_status as enum ('Programme', 'En cours', 'Termine');
  end if;
  
  if not exists (select 1 from pg_type where typname = 'match_phase') then
    create type match_phase as enum ('Poule', 'Quart', 'Demi', 'PetiteFinale', 'Finale');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Fonction utilitaire : mise à jour automatique de updated_at
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- staff_roles : remplace la table "admins" du PHP.
-- Les comptes sont créés dans auth.users (Supabase Auth) ; cette table stocke
-- uniquement le rôle métier associé, tenu à distance du client (RLS ci-dessous).
-- ---------------------------------------------------------------------------
create table staff_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  role staff_role not null default 'admin',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- tournaments
-- ---------------------------------------------------------------------------
create table tournaments (
  id bigint generated always as identity primary key,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint uq_tournament_name unique (name)
);

-- ---------------------------------------------------------------------------
-- teams
-- logo_path : chemin/URL publique dans le bucket Supabase Storage "team-logos"
-- (remplace logo_blob/logo_mime, qui étaient un BLOB SQL côté PHP)
-- ---------------------------------------------------------------------------
create table teams (
  id bigint generated always as identity primary key,
  tournament_id bigint not null references tournaments(id) on delete cascade,
  name text not null,
  logo_path text,
  created_at timestamptz not null default now(),
  constraint uq_teams_tournament_name unique (tournament_id, name)
);

create index idx_teams_tournament_id on teams(tournament_id);

-- ---------------------------------------------------------------------------
-- pools
-- ---------------------------------------------------------------------------
create table pools (
  id bigint generated always as identity primary key,
  tournament_id bigint not null references tournaments(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  constraint uq_pools_tournament_name unique (tournament_id, name)
);

-- ---------------------------------------------------------------------------
-- pool_teams : une équipe appartient à UNE seule poule (règle métier historique)
-- ---------------------------------------------------------------------------
create table pool_teams (
  id bigint generated always as identity primary key,
  pool_id bigint not null references pools(id) on delete cascade,
  team_id bigint not null references teams(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint uq_pool_team unique (pool_id, team_id),
  constraint uq_pool_teams_team_id unique (team_id)
);

-- ---------------------------------------------------------------------------
-- matches
-- ---------------------------------------------------------------------------
create table matches (
  id bigint generated always as identity primary key,
  tournament_id bigint not null references tournaments(id) on delete cascade,
  team1_id bigint not null references teams(id) on delete restrict,
  team2_id bigint not null references teams(id) on delete restrict,
  match_date date not null,
  match_time time not null default '00:00:00',
  status match_status not null default 'Programme',
  phase match_phase not null default 'Poule',
  trial_template text not null default 'legacy',
  score_team1 integer,
  score_team2 integer,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_different_teams check (team1_id <> team2_id),
  constraint chk_scores_non_negative check (
    (score_team1 is null or score_team1 >= 0) and
    (score_team2 is null or score_team2 >= 0)
  )
);

create index idx_match_status on matches(status);
create index idx_match_datetime on matches(match_date, match_time);
create index idx_matches_tournament_id on matches(tournament_id);
create index idx_matches_phase on matches(phase);

create trigger trg_matches_updated_at
  before update on matches
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- match_trials : les "épreuves" (6 par match), score total = somme automatique
-- ---------------------------------------------------------------------------
create table match_trials (
  id bigint generated always as identity primary key,
  match_id bigint not null references matches(id) on delete cascade,
  trial_order smallint not null,
  trial_name text not null,
  team1_points integer not null default 0,
  team2_points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_match_trial_order unique (match_id, trial_order),
  constraint chk_trial_points_non_negative check (team1_points >= 0 and team2_points >= 0)
);

create index idx_match_trials_match_id on match_trials(match_id);

create trigger trg_match_trials_updated_at
  before update on match_trials
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- match_change_logs : audit trail (statut / score / publication)
-- ---------------------------------------------------------------------------
create table match_change_logs (
  id bigint generated always as identity primary key,
  match_id bigint not null references matches(id) on delete cascade,
  staff_user_id uuid not null references auth.users(id) on delete restrict,
  staff_username text not null,
  action text not null default 'update_match_state',
  old_status match_status,
  new_status match_status,
  old_score_team1 integer,
  new_score_team1 integer,
  old_score_team2 integer,
  new_score_team2 integer,
  old_published boolean,
  new_published boolean,
  created_at timestamptz not null default now()
);

create index idx_match_change_logs_match_id on match_change_logs(match_id);
create index idx_match_change_logs_created_at on match_change_logs(created_at);

-- ---------------------------------------------------------------------------
-- Seed minimal : un tournoi par défaut (comme le schema.sql d'origine)
-- ---------------------------------------------------------------------------
insert into tournaments (name, is_active)
select 'Tournoi principal', true
where not exists (select 1 from tournaments);

-- Aucun compte staff n'est créé ici : les comptes admin/arbitre doivent être
-- créés via Supabase Auth puis rattachés dans staff_roles (voir README).
