"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MatchWithTeams } from "@bible-masters/shared";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { phaseLabel, statusClass, statusLabel } from "./match-format";

export interface TrialRow {
  trialOrder: number;
  trialName: string;
  team1Points: number;
  team2Points: number;
}

interface LiveMatchViewProps {
  initialMatch: MatchWithTeams;
  initialTrials: TrialRow[];
}

export function LiveMatchView({ initialMatch, initialTrials }: LiveMatchViewProps) {
  const [match, setMatch] = useState(initialMatch);
  const [trials, setTrials] = useState(initialTrials);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calcul des totaux (identique au back‑office)
  const totals = useMemo(() => {
    return trials.reduce(
      (acc, t) => ({
        team1: acc.team1 + t.team1Points,
        team2: acc.team2 + t.team2Points,
      }),
      { team1: 0, team2: 0 }
    );
  }, [trials]);

  // Abonnement Realtime
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`match-${match.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${match.id}` },
        (payload) => {
          const row = payload.new as any;
          setMatch((prev) => ({
            ...prev,
            status: row.status,
            phase: row.phase,
            scoreTeam1: row.score_team1,
            scoreTeam2: row.score_team2,
            published: row.published,
            updatedAt: row.updated_at,
          }));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "match_trials", filter: `match_id=eq.${match.id}` },
        (payload) => {
          const row = (payload.new ?? payload.old) as any;
          setTrials((prev) => {
            const next = [...prev];
            const idx = next.findIndex((t) => t.trialOrder === row.trial_order);
            const updated: TrialRow = {
              trialOrder: row.trial_order,
              trialName: row.trial_name,
              team1Points: row.team1_points,
              team2Points: row.team2_points,
            };
            if (idx >= 0) next[idx] = updated;
            else next.push(updated);
            return next.sort((a, b) => a.trialOrder - b.trialOrder);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match.id]);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const cls = statusClass(match.status);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm ${
        isFullscreen ? "justify-center" : ""
      }`}
    >
      {/* En‑tête : statut, phase, plein écran */}
      <div className="flex items-center justify-between">
        <span className={`status-pill status-pill--${cls}`}>{statusLabel(match.status)}</span>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>{phaseLabel(match.phase)}</span>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold hover:bg-slate-100"
          >
            {isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          </button>
        </div>
      </div>

      {/* Score global */}
      <div className="grid grid-cols-3 items-center gap-4 text-center">
        <TeamColumn name={match.team1Name} logoUrl={match.team1LogoUrl} />
        <div className="text-5xl font-black tabular-nums text-slate-900">
          {match.scoreTeam1 ?? "–"} <span className="text-2xl text-slate-400">:</span>{" "}
          {match.scoreTeam2 ?? "–"}
        </div>
        <TeamColumn name={match.team2Name} logoUrl={match.team2LogoUrl} />
      </div>

      {/* Tableau des épreuves – identique au back‑office */}
      <div className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-100">
        {/* En‑tête du tableau */}
        <div className="grid grid-cols-[1fr_100px_100px] gap-2 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase text-slate-500">
          <span>Épreuve</span>
          <span className="text-center">{match.team1Name}</span>
          <span className="text-center">{match.team2Name}</span>
        </div>

        {/* Lignes des épreuves */}
        {trials.map((trial) => (
          <div
            key={trial.trialOrder}
            className="grid grid-cols-[1fr_100px_100px] items-center gap-2 px-4 py-2"
          >
            <span className="text-sm font-medium text-slate-700">
              {trial.trialOrder}. {trial.trialName}
            </span>
            <span className="text-center text-sm font-semibold tabular-nums text-slate-800">
              {trial.team1Points}
            </span>
            <span className="text-center text-sm font-semibold tabular-nums text-slate-800">
              {trial.team2Points}
            </span>
          </div>
        ))}

        {/* Ligne des totaux (comme dans le back‑office) */}
        <div className="grid grid-cols-[1fr_100px_100px] items-center gap-2 bg-slate-50 px-4 py-2 font-black tabular-nums text-slate-800">
          <span className="text-sm font-bold uppercase text-slate-500">Total</span>
          <span className="text-center">{totals.team1}</span>
          <span className="text-center">{totals.team2}</span>
        </div>
      </div>
    </div>
  );
}

function TeamColumn({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={name} className="h-16 w-16 rounded-full object-cover" />
      ) : (
        <div className="h-16 w-16 rounded-full bg-slate-200" />
      )}
      <span className="text-base font-bold text-slate-800">{name}</span>
    </div>
  );
}