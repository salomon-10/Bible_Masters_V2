-- Bible Masters — active le flux Realtime pour le direct public et le
-- tableau de bord admin (remplace le polling HTML de user/match.php).
--
-- IDEMPOTENCE : "ALTER PUBLICATION ... ADD TABLE" n'a pas de clause
-- IF NOT EXISTS en Postgres et échoue avec "is already member of
-- publication" si rejoué. On vérifie donc pg_publication_tables avant
-- d'ajouter chaque table.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'matches'
  ) then
    alter publication supabase_realtime add table matches;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'match_trials'
  ) then
    alter publication supabase_realtime add table match_trials;
  end if;
end $$;

-- Idempotent par nature : réappliquer la même valeur ne provoque pas d'erreur.
alter table matches replica identity full;
alter table match_trials replica identity full;
