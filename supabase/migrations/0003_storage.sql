-- Bible Masters — Supabase Storage pour les logos d'équipes
-- Remplace teams.logo_blob/logo_mime (BLOB SQL) par un bucket public.
-- Reprend les contraintes de admin/dashboard.php : PNG/JPG/WEBP, 2 Mo max.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'team-logos',
  'team-logos',
  true,
  2097152, -- 2 MB, identique à la limite PHP (2 * 1024 * 1024)
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- Lecture publique des logos (le bucket est public, mais on garde une policy
-- explicite pour la clarté et pour permettre de le passer en privé plus tard).
create policy team_logos_public_read on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'team-logos');

-- Écriture (upload/replace/delete) réservée au staff admin, comme
-- readUploadedTeamLogo()/createTeam() dans admin/dashboard.php.
create policy team_logos_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'team-logos' and is_admin_staff());

create policy team_logos_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'team-logos' and is_admin_staff())
  with check (bucket_id = 'team-logos' and is_admin_staff());

create policy team_logos_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'team-logos' and is_admin_staff());
