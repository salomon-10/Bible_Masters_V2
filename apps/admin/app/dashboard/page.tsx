import { requireStaffAuth } from "@/lib/auth";
import { fetchPools, fetchTeamsGroupedByPool, fetchTournaments, fetchUnassignedTeams, resolveTournamentId } from "@/lib/data";
import {
  AttachTeamToPoolForm,
  CreatePoolForm,
  CreateTeamForm,
  CreateTournamentForm,
  DeleteTeamForm,
  DeleteTournamentForm,
} from "@/components/DashboardForms";

interface PageProps {
  searchParams: Promise<{ tournament_id?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  await requireStaffAuth("admin");

  const params = await searchParams;
  const requestedId = params.tournament_id ? Number(params.tournament_id) : null;
  const tournamentId = await resolveTournamentId(requestedId);
  const tournaments = await fetchTournaments();

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-bold text-slate-800">Tournois</h2>
        <CreateTournamentForm />
        <ul className="mt-4 flex flex-col gap-2">
          {tournaments.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
              <a href={`/dashboard?tournament_id=${t.id}`} className={`font-medium ${t.id === tournamentId ? "text-brand-700" : "text-slate-700"}`}>
                {t.name}
              </a>
              <DeleteTournamentForm tournamentId={t.id} />
            </li>
          ))}
        </ul>
      </section>

      {tournamentId && (
        <TournamentDetail tournamentId={tournamentId} />
      )}
    </div>
  );
}

async function TournamentDetail({ tournamentId }: { tournamentId: number }) {
  const [pools, unassignedTeams, teamsByPool] = await Promise.all([
    fetchPools(tournamentId),
    fetchUnassignedTeams(tournamentId),
    fetchTeamsGroupedByPool(tournamentId),
  ]);

  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-bold text-slate-800">Ajouter une équipe</h2>
        <CreateTeamForm tournamentId={tournamentId} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-bold text-slate-800">Poules</h2>
        <CreatePoolForm tournamentId={tournamentId} />
        <div className="mt-4">
          <AttachTeamToPoolForm
            tournamentId={tournamentId}
            pools={pools}
            unassignedTeams={unassignedTeams.map((t) => ({ id: t.id, name: t.name }))}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Object.entries(teamsByPool).map(([poolName, teams]) => (
            <div key={poolName} className="rounded-lg border border-slate-100 p-3">
              <h3 className="mb-2 text-sm font-bold text-brand-700">{poolName}</h3>
              <ul className="flex flex-col gap-1">
                {teams.map((t) => (
                  <li key={t.id} className="flex items-center justify-between text-sm">
                    <span>{t.name}</span>
                    <DeleteTeamForm tournamentId={tournamentId} teamId={t.id} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {unassignedTeams.length > 0 && (
            <div className="rounded-lg border border-dashed border-slate-200 p-3">
              <h3 className="mb-2 text-sm font-bold text-slate-500">Équipes non affectées</h3>
              <ul className="flex flex-col gap-1">
                {unassignedTeams.map((t) => (
                  <li key={t.id} className="flex items-center justify-between text-sm">
                    <span>{t.name}</span>
                    <DeleteTeamForm tournamentId={tournamentId} teamId={t.id} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
