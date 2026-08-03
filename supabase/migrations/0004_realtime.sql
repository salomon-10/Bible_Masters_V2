-- Bible Masters — active le flux Realtime pour le direct public et le
-- tableau de bord admin (remplace le polling HTML de user/match.php).

alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table match_trials;

-- Nécessaire pour recevoir les valeurs complètes (old + new) sur UPDATE.
alter table matches replica identity full;
alter table match_trials replica identity full;
