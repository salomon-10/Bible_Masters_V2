-- Bible Masters — Supabase Storage pour les logos d'équipes

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'team-logos',
  'team-logos',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- Suppression des anciennes policies avant recréation
drop policy if exists team_logos_public_read on storage.objects;
drop policy if exists team_logos_admin_insert on storage.objects;
drop policy if exists team_logos_admin_update on storage.objects;
drop policy if exists team_logos_admin_delete on storage.objects;


-- Lecture publique
create policy team_logos_public_read
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'team-logos'
);


-- Upload réservé aux admins
create policy team_logos_admin_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'team-logos'
  and is_admin_staff()
);


-- Modification réservée aux admins
create policy team_logos_admin_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'team-logos'
  and is_admin_staff()
)
with check (
  bucket_id = 'team-logos'
  and is_admin_staff()
);


-- Suppression réservée aux admins
create policy team_logos_admin_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'team-logos'
  and is_admin_staff()
);