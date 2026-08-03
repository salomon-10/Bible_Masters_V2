-- Bible Masters — Row Level Security
-- Reproduit les règles d'accès du code PHP :
--   - Public (anon) : lecture seule, uniquement les matchs "published = true"
--     et les données de tournoi/équipes/poules associées.
--   - Staff authentifié (role = admin) : lecture/écriture complète.
--   - Staff authentifié (role = arbitre) : lecture complète, écriture limitée
--     au statut/score/visibilité des matchs (comme admin/visibilite.php et
--     admin/set_score.php, qui acceptent ['admin', 'arbitre']), mais PAS la
--     gestion des tournois/équipes/poules (réservée à 'admin' dans
--     admin/dashboard.php via requireAdminAuth('admin')).

alter table tournaments enable row level security;
alter table teams enable row level security;
alter table pools enable row level security;
alter table pool_teams enable row level security;
alter table matches enable row level security;
alter table match_trials enable row level security;
alter table match_change_logs enable row level security;
alter table staff_roles enable row level security;

-- ---------------------------------------------------------------------------
-- Fonctions utilitaires (security definer pour éviter la récursion RLS)
-- ---------------------------------------------------------------------------
create or replace function current_staff_role()
returns staff_role
language sql
security definer
stable
set search_path = public
as $$
  select role from staff_roles where user_id = auth.uid();
$$;

create or replace function is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from staff_roles where user_id = auth.uid());
$$;

create or replace function is_admin_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from staff_roles where user_id = auth.uid() and role = 'admin');
$$;

-- ---------------------------------------------------------------------------
-- staff_roles : un utilisateur authentifié peut lire UNIQUEMENT sa propre
-- ligne (nécessaire pour résoudre son rôle après connexion, voir
-- apps/admin/lib/auth.ts::getStaffSession()). Toute écriture (création d'un
-- compte staff, changement de rôle) reste réservée au client service_role,
-- utilisé uniquement dans des scripts d'administration serveur — jamais
-- exposée au client, comme le bootstrap admin en PHP.
-- ---------------------------------------------------------------------------
create policy staff_roles_self_read on staff_roles
  for select
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- tournaments — lecture publique, écriture admin uniquement
-- ---------------------------------------------------------------------------
create policy tournaments_public_read on tournaments
  for select
  to anon, authenticated
  using (true);

create policy tournaments_admin_write on tournaments
  for insert to authenticated
  with check (is_admin_staff());

create policy tournaments_admin_update on tournaments
  for update to authenticated
  using (is_admin_staff())
  with check (is_admin_staff());

create policy tournaments_admin_delete on tournaments
  for delete to authenticated
  using (is_admin_staff());

-- ---------------------------------------------------------------------------
-- teams — lecture publique, écriture admin uniquement
-- ---------------------------------------------------------------------------
create policy teams_public_read on teams
  for select
  to anon, authenticated
  using (true);

create policy teams_admin_write on teams
  for insert to authenticated
  with check (is_admin_staff());

create policy teams_admin_update on teams
  for update to authenticated
  using (is_admin_staff())
  with check (is_admin_staff());

create policy teams_admin_delete on teams
  for delete to authenticated
  using (is_admin_staff());

-- ---------------------------------------------------------------------------
-- pools / pool_teams — lecture publique, écriture admin uniquement
-- ---------------------------------------------------------------------------
create policy pools_public_read on pools
  for select
  to anon, authenticated
  using (true);

create policy pools_admin_write on pools
  for insert to authenticated
  with check (is_admin_staff());

create policy pools_admin_delete on pools
  for delete to authenticated
  using (is_admin_staff());

create policy pool_teams_public_read on pool_teams
  for select
  to anon, authenticated
  using (true);

create policy pool_teams_admin_write on pool_teams
  for insert to authenticated
  with check (is_admin_staff());

create policy pool_teams_admin_delete on pool_teams
  for delete to authenticated
  using (is_admin_staff());

-- ---------------------------------------------------------------------------
-- matches — lecture publique restreinte aux matchs publiés ; le staff
-- (admin + arbitre) voit tout. Écriture : admin (création/CRUD complet) ou
-- admin/arbitre (mise à jour statut/score/publication) via matches_staff_update.
-- La création (insert) et la suppression restent réservées à 'admin', comme
-- create_match.php qui n'est accessible qu'au rôle admin.
-- ---------------------------------------------------------------------------
create policy matches_public_read_published on matches
  for select
  to anon
  using (published = true);

create policy matches_staff_read_all on matches
  for select
  to authenticated
  using (is_staff());

create policy matches_admin_insert on matches
  for insert to authenticated
  with check (is_admin_staff());

create policy matches_staff_update on matches
  for update to authenticated
  using (is_staff())
  with check (is_staff());

create policy matches_admin_delete on matches
  for delete to authenticated
  using (is_admin_staff());

-- ---------------------------------------------------------------------------
-- match_trials — visibles publiquement seulement si le match parent est
-- publié ; modifiables par le staff (admin ou arbitre), comme set_score.php.
-- ---------------------------------------------------------------------------
create policy match_trials_public_read on match_trials
  for select
  to anon
  using (
    exists (
      select 1 from matches m
      where m.id = match_trials.match_id and m.published = true
    )
  );

create policy match_trials_staff_read_all on match_trials
  for select
  to authenticated
  using (is_staff());

create policy match_trials_staff_update on match_trials
  for update to authenticated
  using (is_staff())
  with check (is_staff());

create policy match_trials_staff_insert on match_trials
  for insert to authenticated
  with check (is_staff());

-- ---------------------------------------------------------------------------
-- match_change_logs — lecture/écriture réservées au staff (aucun accès public)
-- ---------------------------------------------------------------------------
create policy match_change_logs_staff_read on match_change_logs
  for select
  to authenticated
  using (is_staff());

create policy match_change_logs_staff_insert on match_change_logs
  for insert to authenticated
  with check (is_staff() and staff_user_id = auth.uid());
