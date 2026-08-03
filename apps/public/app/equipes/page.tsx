import { fetchTeamsGroupedByPool, fetchTournamentBracket, fetchTournamentQualification, resolveTournamentId } from "@/lib/data";
import { phaseLabel } from "@/components/match-format";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ tournament_id?: string }>;
}

export default async function TeamsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestedId = params.tournament_id ? Number(params.tournament_id) : null;
  const tournamentId = await resolveTournamentId(requestedId);

  if (!tournamentId) {
    return <p className="text-slate-500">Aucun tournoi disponible.</p>;
  }

  const [teamsByPool, qualification, bracket] = await Promise.all([
    fetchTeamsGroupedByPool(tournamentId),
    fetchTournamentQualification(tournamentId),
    fetchTournamentBracket(tournamentId),
  ]);

  const qualifiedIds = new Set(qualification.qualifiedTeamIds);
  const eliminatedIds = new Set(qualification.eliminatedTeamIds);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="mb-4 text-2xl font-bold text-slate-800">Équipes &amp; poules</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Object.entries(teamsByPool).map(([poolName, teams]) => {
            const standingRows = qualification.standings[poolName] ?? [];
            const rankByTeam = new Map(standingRows.map((r) => [r.teamId, r]));
            return (
              <div key={poolName} className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="mb-3 font-bold text-brand-700">{poolName}</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-slate-400">
                      <th className="py-1">Équipe</th>
                      <th className="py-1 text-center">J</th>
                      <th className="py-1 text-center">Pts</th>
                      <th className="py-1 text-center">+/-</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team) => {
                      const row = rankByTeam.get(team.id);
                      const isQualified = qualifiedIds.has(team.id);
                      const isEliminated = eliminatedIds.has(team.id);
                      return (
                        <tr key={team.id} className="border-t border-slate-100">
                          <td className="flex items-center gap-2 py-2">
                            {team.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={team.logoUrl} alt={team.name} className="h-6 w-6 rounded-full object-cover" />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-slate-200" />
                            )}
                            <span className="font-medium text-slate-800">{team.name}</span>
                            {isQualified && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                Qualifié
                              </span>
                            )}
                            {isEliminated && (
                              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                Éliminé
                              </span>
                            )}
                          </td>
                          <td className="text-center tabular-nums">{row?.played ?? 0}</td>
                          <td className="text-center tabular-nums font-bold">{row?.points ?? 0}</td>
                          <td className="text-center tabular-nums">{row?.goalDifference ?? 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
        {!qualification.ready && (
          <p className="mt-4 text-sm text-slate-500">
            La phase de poules doit être terminée dans toutes les poules pour connaître les équipes qualifiées.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-slate-800">Tableau final</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(bracket)
            .filter(([phase]) => phase !== "Poule")
            .map(([phase, matches]) => (
              <div key={phase} className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="mb-3 font-bold text-brand-700">{phaseLabel(phase)}</h3>
                {matches.length === 0 ? (
                  <p className="text-xs text-slate-400">Pas encore programmé.</p>
                ) : (
                  <ul className="flex flex-col gap-2 text-sm">
                    {matches.map((m) => (
                      <li key={m.id}>
                        <a href={`/match/${m.id}`} className="block rounded-lg px-2 py-1 hover:bg-slate-50">
                          <span className="font-medium">{m.team1Name}</span> vs <span className="font-medium">{m.team2Name}</span>
                          <span className="ml-2 tabular-nums text-slate-500">
                            {m.scoreTeam1 ?? "–"}-{m.scoreTeam2 ?? "–"}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
