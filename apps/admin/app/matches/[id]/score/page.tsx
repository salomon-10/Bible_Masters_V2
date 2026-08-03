import { notFound } from "next/navigation";
import { requireStaffAuth } from "@/lib/auth";
import { fetchMatchById, fetchMatchChangeLogs, fetchMatchTrials } from "@/lib/data";
import { TrialEditor } from "@/components/TrialEditor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ScoreMatchPage({ params }: PageProps) {
  await requireStaffAuth(["admin", "arbitre"]);

  const { id } = await params;
  const matchId = Number(id);
  if (!Number.isInteger(matchId) || matchId <= 0) notFound();

  const match = await fetchMatchById(matchId);
  if (!match) notFound();

  const [trials, logs] = await Promise.all([fetchMatchTrials(matchId), fetchMatchChangeLogs(matchId, 50)]);

  return (
    <div className="flex flex-col gap-6">
      <TrialEditor
        matchId={matchId}
        initialStatus={match.status}
        initialTrials={trials}
        team1Name={match.team1Name}
        team2Name={match.team2Name}
      />

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold text-slate-700">Historique des modifications</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-400">Aucune modification enregistrée pour l&apos;instant.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-xs text-slate-500">
            {logs.map((log) => (
              <li key={log.id}>
                {new Date(log.createdAt).toLocaleString("fr-FR")} — {log.staffUsername} : {log.oldStatus ?? "—"} → {log.newStatus ?? "—"}
                {" "}({log.oldScoreTeam1 ?? "–"}-{log.oldScoreTeam2 ?? "–"} → {log.newScoreTeam1 ?? "–"}-{log.newScoreTeam2 ?? "–"})
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
