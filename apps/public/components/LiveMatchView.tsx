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

  const totals = useMemo(() => {
    return trials.reduce(
      (acc, t) => ({
        team1: acc.team1 + t.team1Points,
        team2: acc.team2 + t.team2Points,
      }),
      { team1: 0, team2: 0 }
    );
  }, [trials]);

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
      className={`flex flex-col gap-4 sm:gap-6 lg:gap-8 rounded-xl sm:rounded-2xl bg-white p-4 sm:p-6 lg:p-10 shadow-sm w-full max-w-7xl mx-auto ${
        isFullscreen ? "justify-center min-h-screen" : ""
      }`}
    >
      {/* En‑tête */}
      <div className="flex items-center justify-between gap-2">
        <span className={`status-pill status-pill--${cls} text-xs sm:text-sm lg:text-base`}>
          {statusLabel(match.status)}
        </span>
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500">
          <span className="hidden xs:inline sm:inline">{phaseLabel(match.phase)}</span>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-lg border border-slate-300 px-2 py-1 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold hover:bg-slate-100 whitespace-nowrap"
          >
            {isFullscreen ? "Quitter" : "Plein écran"}
          </button>
        </div>
      </div>

      {/* Ligne d'en-tête : logos seuls (nom retiré) */}
      <div className="grid grid-cols-[1fr_2fr_1fr] gap-1 sm:gap-2 items-center">
        {/* Équipe 1 */}
        <div className="flex justify-center items-center overflow-hidden">
          {match.team1LogoUrl ? (
            <img
              src={match.team1LogoUrl}
              alt={match.team1Name}
              className="w-14 h-14 xs:w-16 xs:h-16 sm:w-24 sm:h-24 md:w-40 md:h-40 lg:w-64 lg:h-64 rounded-full object-cover shadow-md flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-24 sm:h-24 md:w-40 md:h-40 lg:w-64 lg:h-64 rounded-full bg-slate-200 shadow-md flex-shrink-0" />
          )}
        </div>

        {/* Score total au centre */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 lg:gap-4 text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black tabular-nums text-slate-900">
          <span>{match.scoreTeam1 ?? "–"}</span>
          <span className="text-xl xs:text-2xl sm:text-3xl lg:text-5xl text-slate-400">:</span>
          <span>{match.scoreTeam2 ?? "–"}</span>
        </div>

        {/* Équipe 2 */}
        <div className="flex justify-center items-center overflow-hidden">
          {match.team2LogoUrl ? (
            <img
              src={match.team2LogoUrl}
              alt={match.team2Name}
              className="w-14 h-14 xs:w-16 xs:h-16 sm:w-24 sm:h-24 md:w-40 md:h-40 lg:w-64 lg:h-64 rounded-full object-cover shadow-md flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-24 sm:h-24 md:w-40 md:h-40 lg:w-64 lg:h-64 rounded-full bg-slate-200 shadow-md flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Tableau des épreuves */}
      <div className="flex flex-col divide-y divide-slate-100 rounded-lg sm:rounded-xl border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-[1fr_2fr_1fr] gap-1 sm:gap-2 bg-slate-50 px-2 py-2 sm:px-4 sm:py-3 text-[10px] xs:text-xs sm:text-sm lg:text-base font-semibold uppercase text-slate-500">
          <span className="text-center truncate px-1">{match.team1Name}</span>
          <span className="text-center text-xs sm:text-sm lg:text-lg">Épreuve</span>
          <span className="text-center truncate px-1">{match.team2Name}</span>
        </div>

        {trials.map((trial) => (
          <div
            key={trial.trialOrder}
            className="grid grid-cols-[1fr_2fr_1fr] items-center gap-1 sm:gap-2 px-2 py-2 sm:px-4 sm:py-4"
          >
            <span className="text-center text-base xs:text-lg sm:text-2xl md:text-3xl font-bold tabular-nums text-slate-800">
              {trial.team1Points}
            </span>
            <span className="text-center text-[11px] xs:text-xs sm:text-base md:text-2xl font-semibold text-slate-700 truncate px-1">
              {trial.trialOrder}. {trial.trialName}
            </span>
            <span className="text-center text-base xs:text-lg sm:text-2xl md:text-3xl font-bold tabular-nums text-slate-800">
              {trial.team2Points}
            </span>
          </div>
        ))}

        <div className="grid grid-cols-[1fr_2fr_1fr] items-center gap-1 sm:gap-2 bg-slate-50 px-2 py-2 sm:px-4 sm:py-4 font-black tabular-nums text-slate-800">
          <span className="text-center text-lg xs:text-xl sm:text-2xl md:text-3xl">{totals.team1}</span>
          <span className="text-center text-xs xs:text-sm sm:text-base md:text-xl font-bold uppercase text-slate-500">
            Total
          </span>
          <span className="text-center text-lg xs:text-xl sm:text-2xl md:text-3xl">{totals.team2}</span>
        </div>
      </div>
    </div>
  );
}