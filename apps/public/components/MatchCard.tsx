import type { MatchWithTeams } from "@bible-masters/shared";
import { phaseLabel, scoreText, statusClass, statusLabel } from "./match-format";

export function MatchCard({ match }: { match: MatchWithTeams }) {
  const cls = statusClass(match.status);

  return (
    <a
      href={`/match/${match.id}`}
      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-brand-500 hover:shadow-md"
    >
      <div className="flex flex-1 items-center gap-3">
        <TeamBadge name={match.team1Name} logoUrl={match.team1LogoUrl} />
        <span className="text-sm font-semibold text-slate-500">vs</span>
        <TeamBadge name={match.team2Name} logoUrl={match.team2LogoUrl} align="right" />
      </div>
      <div className="flex flex-col items-end gap-1 text-right">
        <span className={`status-pill status-pill--${cls}`}>{statusLabel(match.status)}</span>
        <span className="text-sm font-bold tabular-nums text-slate-800">{scoreText(match)}</span>
        <span className="text-xs text-slate-400">
          {phaseLabel(match.phase)} · {match.matchDate}
        </span>
      </div>
    </a>
  );
}

function TeamBadge({ name, logoUrl, align = "left" }: { name: string; logoUrl: string | null; align?: "left" | "right" }) {
  return (
    <div className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={name} className="h-8 w-8 rounded-full object-cover" />
      ) : (
        <div className="h-8 w-8 rounded-full bg-slate-200" />
      )}
      <span className="text-sm font-semibold text-slate-800">{name}</span>
    </div>
  );
}
