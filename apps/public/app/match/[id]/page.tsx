import { notFound } from "next/navigation";
import { fetchMatchById, fetchMatchTrials } from "@/lib/data";
import { LiveMatchView } from "@/components/LiveMatchView";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchPage({ params }: PageProps) {
  const { id } = await params;
  const matchId = Number(id);
  if (!Number.isInteger(matchId) || matchId <= 0) notFound();

  const match = await fetchMatchById(matchId);
  if (!match || !match.published) notFound();

  const trials = await fetchMatchTrials(matchId);

  return (
    <div className="mx-auto max-w-2xl">
      <LiveMatchView initialMatch={match} initialTrials={trials} />
    </div>
  );
}
