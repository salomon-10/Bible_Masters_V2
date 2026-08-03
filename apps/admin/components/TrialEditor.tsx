"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { endMatchAction, saveTrialAction, startMatchAction } from "@/actions/scoring";
import type { MatchStatus } from "@bible-masters/shared";

export interface TrialRow {
  trialOrder: number;
  trialName: string;
  team1Points: number;
  team2Points: number;
}

interface TrialEditorProps {
  matchId: number;
  initialStatus: MatchStatus;
  initialTrials: TrialRow[];
  team1Name: string;
  team2Name: string;
}

const AUTOSAVE_DEBOUNCE_MS = 600;

export function TrialEditor({ matchId, initialStatus, initialTrials, team1Name, team2Name }: TrialEditorProps) {
  const [status, setStatus] = useState(initialStatus);
  const [trials, setTrials] = useState(initialTrials);
  const [selectedTrialOrder, setSelectedTrialOrder] = useState<number | null>(null);
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const debounceTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const totals = trials.reduce(
    (acc, t) => ({ team1: acc.team1 + t.team1Points, team2: acc.team2 + t.team2Points }),
    { team1: 0, team2: 0 }
  );

  const scheduleAutosave = useCallback(
    (trialOrder: number, team1Points: number, team2Points: number) => {
      if (debounceTimers.current[trialOrder]) clearTimeout(debounceTimers.current[trialOrder]);
      debounceTimers.current[trialOrder] = setTimeout(() => {
        startTransition(async () => {
          const result = await saveTrialAction(matchId, trialOrder, team1Points, team2Points);
          setBanner({ ok: result.ok, message: result.message });
        });
      }, AUTOSAVE_DEBOUNCE_MS);
    },
    [matchId]
  );

  function updateTrial(trialOrder: number, field: "team1Points" | "team2Points", value: number) {
    setTrials((prev) => {
      const next = prev.map((t) => (t.trialOrder === trialOrder ? { ...t, [field]: Math.max(0, value) } : t));
      const updated = next.find((t) => t.trialOrder === trialOrder)!;
      scheduleAutosave(trialOrder, updated.team1Points, updated.team2Points);
      return next;
    });
  }

  function adjustPoints(trialOrder: number, field: "team1Points" | "team2Points", delta: number) {
    const trial = trials.find((t) => t.trialOrder === trialOrder);
    if (!trial) return;
    const current = trial[field];
    const nextVal = Math.max(0, current + delta);
    updateTrial(trialOrder, field, nextVal);
  }

  function handleStart() {
    startTransition(async () => {
      const result = await startMatchAction(matchId);
      setBanner({ ok: result.ok, message: result.message });
      if (result.ok) {
        setStatus("En cours");
        setTrials((prev) => prev.map((t) => ({ ...t, team1Points: 0, team2Points: 0 })));
        if (trials.length > 0) setSelectedTrialOrder(trials[0].trialOrder);
      }
    });
  }

  function handleEnd() {
    startTransition(async () => {
      const result = await endMatchAction(matchId);
      setBanner({ ok: result.ok, message: result.message });
      if (result.ok) {
        setStatus("Termine");
        setSelectedTrialOrder(null);
      }
    });
  }

  const locked = status !== "En cours";
  const activeTrial = trials.find((t) => t.trialOrder === selectedTrialOrder);

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {team1Name} <span className="text-brand-600 dark:text-brand-400">vs</span> {team2Name}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Statut : {status}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleStart}
            disabled={status !== "Programme" || isPending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40 transition-colors"
          >
            Démarrer le match
          </button>
          <button
            onClick={handleEnd}
            disabled={status !== "En cours" || isPending}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
          >
            Terminer le match
          </button>
        </div>
      </div>

      {banner && (
        <p className={`rounded-lg px-3 py-2 text-sm font-medium ${banner.ok ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400"}`}>
          {banner.message}
        </p>
      )}

      {locked && (
        <p className="rounded-lg bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2.5 text-sm font-medium text-amber-800 dark:text-amber-300">
          🔒 Scores verrouillés : démarrez le match avant de pouvoir sélectionner une épreuve et modifier ses scores.
        </p>
      )}

      {/* Panneau d'édition pour l'épreuve active */}
      {!locked && (
        <div className="rounded-xl border border-brand-200 dark:border-brand-900 bg-brand-50/50 dark:bg-brand-950/30 p-5">
          {activeTrial ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-brand-100 dark:border-brand-900/50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {activeTrial.trialOrder}
                  </span>
                  <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                    {activeTrial.trialName}
                  </h2>
                </div>
                <span className="rounded-full bg-brand-100 dark:bg-brand-900/80 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
                  Épreuve active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Team 1 Score Control */}
                <div className="flex flex-col items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-center mb-1">
                    {team1Name}
                  </span>
                  <span className="text-3xl font-black text-brand-600 dark:text-brand-400 my-2 tabular-nums">
                    {activeTrial.team1Points}
                  </span>
                  <div className="flex items-center gap-2 mt-2 w-full justify-center">
                    <button
                      type="button"
                      onClick={() => adjustPoints(activeTrial.trialOrder, "team1Points", -10)}
                      disabled={activeTrial.team1Points <= 0}
                      className="flex h-10 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold hover:bg-red-200 dark:hover:bg-red-900 disabled:opacity-40 transition-colors"
                      title="Diminuer de 10 points"
                    >
                      -10
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={activeTrial.team1Points}
                      onChange={(e) => updateTrial(activeTrial.trialOrder, "team1Points", Number(e.target.value))}
                      className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-2 text-center text-sm font-bold text-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => adjustPoints(activeTrial.trialOrder, "team1Points", 10)}
                      className="flex h-10 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
                      title="Augmenter de 10 points"
                    >
                      +10
                    </button>
                  </div>
                </div>

                {/* Team 2 Score Control */}
                <div className="flex flex-col items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-center mb-1">
                    {team2Name}
                  </span>
                  <span className="text-3xl font-black text-brand-600 dark:text-brand-400 my-2 tabular-nums">
                    {activeTrial.team2Points}
                  </span>
                  <div className="flex items-center gap-2 mt-2 w-full justify-center">
                    <button
                      type="button"
                      onClick={() => adjustPoints(activeTrial.trialOrder, "team2Points", -10)}
                      disabled={activeTrial.team2Points <= 0}
                      className="flex h-10 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold hover:bg-red-200 dark:hover:bg-red-900 disabled:opacity-40 transition-colors"
                      title="Diminuer de 10 points"
                    >
                      -10
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={activeTrial.team2Points}
                      onChange={(e) => updateTrial(activeTrial.trialOrder, "team2Points", Number(e.target.value))}
                      className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-2 text-center text-sm font-bold text-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => adjustPoints(activeTrial.trialOrder, "team2Points", 10)}
                      className="flex h-10 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
                      title="Augmenter de 10 points"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
              👈 Cliquez sur une épreuve ci-dessous pour sélectionner la rubrique et ajuster ses scores avec les boutons (+10 / -10).
            </div>
          )}
        </div>
      )}

      {/* Liste des épreuves */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Liste des épreuves / rubriques
          </h2>
          {!locked && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Cliquez sur une ligne pour l&apos;activer
            </span>
          )}
        </div>

        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_120px] gap-2 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            <span>Épreuve</span>
            <span className="text-center truncate">{team1Name}</span>
            <span className="text-center truncate">{team2Name}</span>
          </div>

          {trials.map((trial) => {
            const isSelected = selectedTrialOrder === trial.trialOrder;
            return (
              <div
                key={trial.trialOrder}
                onClick={() => {
                  if (!locked) setSelectedTrialOrder(trial.trialOrder);
                }}
                className={`grid grid-cols-[1fr_120px_120px] items-center gap-2 px-4 py-3 transition-colors ${
                  locked
                    ? "opacity-80"
                    : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                } ${
                  isSelected
                    ? "bg-brand-50/70 dark:bg-brand-950/40 font-semibold ring-2 ring-inset ring-brand-500"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                      isSelected
                        ? "bg-brand-600 text-white"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {trial.trialOrder}
                  </span>
                  <span>{trial.trialName}</span>
                  {isSelected && (
                    <span className="ml-2 rounded bg-brand-100 dark:bg-brand-900 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 dark:text-brand-300">
                      Active
                    </span>
                  )}
                </div>

                <div className="text-center font-bold text-slate-800 dark:text-slate-100 tabular-nums text-base">
                  {trial.team1Points}
                </div>

                <div className="text-center font-bold text-slate-800 dark:text-slate-100 tabular-nums text-base">
                  {trial.team2Points}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Score total cumulé :</span>
        <div className="flex gap-6 text-xl font-black tabular-nums text-slate-900 dark:text-slate-100">
          <span>{team1Name}: <span className="text-brand-600 dark:text-brand-400">{totals.team1}</span></span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>{team2Name}: <span className="text-brand-600 dark:text-brand-400">{totals.team2}</span></span>
        </div>
      </div>
    </div>
  );
}
