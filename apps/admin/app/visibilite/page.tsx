import { requireStaffAuth } from "@/lib/auth";
import { fetchMatches, fetchTournaments, resolveTournamentId } from "@/lib/data";
import { VisibilityRow } from "@/components/VisibilityRow";

interface PageProps {
  searchParams: Promise<{ tournament_id?: string }>;
}

export default async function VisibilitePage({ searchParams }: PageProps) {
  await requireStaffAuth(["admin", "arbitre"]);

  const params = await searchParams;
  const requestedId = params.tournament_id ? Number(params.tournament_id) : null;
  const tournamentId = await resolveTournamentId(requestedId);
  const tournaments = await fetchTournaments();

  if (!tournamentId) {
    return <p className="text-slate-500">Aucun tournoi disponible.</p>;
  }

  const matches = await fetchMatches(tournamentId);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-800">Statut &amp; visibilité des matchs</h1>

      <form method="get" className="flex gap-2">
        <select name="tournament_id" defaultValue={tournamentId} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100">Changer</button>
      </form>

      <div className="flex flex-col gap-2">
        {matches.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun match pour ce tournoi.</p>
        ) : (
          matches.map((m) => <VisibilityRow key={m.id} match={m} />)
        )}
      </div>
    </div>
  );
}
