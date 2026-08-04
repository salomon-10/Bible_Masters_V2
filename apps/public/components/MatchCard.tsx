import type { MatchWithTeams } from "@bible-masters/shared";
import { phaseLabel, scoreText, statusClass, statusLabel } from "./match-format";

export function MatchCard({ match }: { match: MatchWithTeams }) {
  const cls = statusClass(match.status);

  return (
    <a
      href={`/match/${match.id}`}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm transition hover:border-brand-500 hover:shadow-md"
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-between sm:justify-start">
        <TeamBadge name={match.team1Name} logoUrl={match.team1LogoUrl} />
        <span className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 shrink-0 px-1">vs</span>
        <TeamBadge name={match.team2Name} logoUrl={match.team2LogoUrl} align="right" />
      </div>

      <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80 pt-2 sm:pt-0 gap-1 text-right">
        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
          <span className={`status-pill status-pill--${cls}`}>{statusLabel(match.status)}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 sm:hidden">
            {phaseLabel(match.phase)}
          </span>
        </div>
        <span className="text-sm sm:text-base font-extrabold tabular-nums text-slate-800 dark:text-slate-100">{scoreText(match)}</span>
        <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-500">
          {phaseLabel(match.phase)} · {match.matchDate}
        </span>
      </div>
    </a>
  );
}

function TeamBadge({ name, logoUrl, align = "left" }: { name: string; logoUrl: string | null; align?: "left" | "right" }) {
  return (
    <div className={`flex items-center gap-2 min-w-0 flex-1 ${align === "right" ? "flex-row-reverse text-right" : "text-left"}`}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={name} className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700" />
      )}
      <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{name}</span>
    </div>
  );
}
