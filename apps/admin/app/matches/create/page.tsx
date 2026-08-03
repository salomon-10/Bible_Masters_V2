import { requireStaffAuth } from "@/lib/auth";
import { fetchTeams, fetchTournaments, resolveTournamentId } from "@/lib/data";
import { CreateMatchForm } from "@/components/CreateMatchForm";

interface PageProps {
  searchParams: Promise<{ tournament_id?: string }>;
}

export default async function CreateMatchPage({ searchParams }: PageProps) {
  await requireStaffAuth("admin");

  const params = await searchParams;
  const requestedId = params.tournament_id ? Number(params.tournament_id) : null;
  const tournamentId = await resolveTournamentId(requestedId);
  const tournaments = await fetchTournaments();

  if (!tournamentId) {
    return <p className="text-slate-500">Créez d&apos;abord un tournoi depuis le tableau de bord.</p>;
  }

  const teams = await fetchTeams(tournamentId);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-800">Créer un match</h1>

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

      {teams.length < 2 ? (
        <p className="text-slate-500">Ajoutez au moins deux équipes à ce tournoi avant de créer un match.</p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <CreateMatchForm tournamentId={tournamentId} teams={teams.map((t) => ({ id: t.id, name: t.name }))} />
        </div>
      )}
    </div>
  );
}
