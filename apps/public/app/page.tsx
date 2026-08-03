import { fetchPublishedMatches, fetchTournamentById, fetchTournaments, resolveTournamentId } from "@/lib/data";
import { MatchCard } from "@/components/MatchCard";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    tournament_id?: string;
    q?: string;
    status?: string;
    match_date?: string;
  }>;
}

const ALLOWED_STATUS_FILTERS = ["all", "Programme", "En cours", "Termine"] as const;

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tournaments = await fetchTournaments();

  const requestedTournamentId = params.tournament_id ? Number(params.tournament_id) : null;
  const tournamentId = await resolveTournamentId(requestedTournamentId);

  const search = (params.q ?? "").trim();
  const statusFilter = ALLOWED_STATUS_FILTERS.includes(params.status as any) ? (params.status as string) : "all";
  const matchDate = params.match_date ?? "";

  if (!tournamentId) {
    return <EmptyState message="Aucun tournoi disponible pour le moment." />;
  }

  const tournament = await fetchTournamentById(tournamentId);
  const matches = await fetchPublishedMatches(tournamentId, {
    status: statusFilter as any,
    search,
    matchDate,
  });

  const live = matches.filter((m) => m.status === "En cours");
  const upcoming = matches.filter((m) => m.status === "Programme");
  const past = matches.filter((m) => m.status === "Termine");

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl bg-brand-600 px-6 py-8 text-white shadow-sm">
        <h1 className="text-2xl font-bold">{tournament?.name ?? "Tournoi"}</h1>
        <p className="mt-1 text-brand-50/90">Résultats et matchs en direct, mis à jour en temps réel.</p>
      </section>

      <form method="get" className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4">
        <select name="tournament_id" defaultValue={tournamentId} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Rechercher une équipe..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <select name="status" defaultValue={statusFilter} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="all">Tous les statuts</option>
          <option value="Programme">À venir</option>
          <option value="En cours">En direct</option>
          <option value="Termine">Terminés</option>
        </select>
        <input
          type="date"
          name="match_date"
          defaultValue={matchDate}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 sm:col-span-4">
          Filtrer
        </button>
      </form>

      <MatchGroup title="En direct" matches={live} emptyText="Aucun match en direct pour le moment." />
      <MatchGroup title="À venir" matches={upcoming} emptyText="Aucun match programmé." />
      <MatchGroup title="Résultats" matches={past} emptyText="Aucun match terminé." />
    </div>
  );
}

function MatchGroup({ title, matches, emptyText }: { title: string; matches: Awaited<ReturnType<typeof fetchPublishedMatches>>; emptyText: string }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      {matches.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">{message}</p>;
}
