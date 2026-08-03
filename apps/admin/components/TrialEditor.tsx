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

  function handleStart() {
    startTransition(async () => {
      const result = await startMatchAction(matchId);
      setBanner({ ok: result.ok, message: result.message });
      if (result.ok) {
        setStatus("En cours");
        setTrials((prev) => prev.map((t) => ({ ...t, team1Points: 0, team2Points: 0 })));
      }
    });
  }

  function handleEnd() {
    startTransition(async () => {
      const result = await endMatchAction(matchId);
      setBanner({ ok: result.ok, message: result.message });
      if (result.ok) setStatus("Termine");
    });
  }

  const locked = status !== "En cours";

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">
            {team1Name} vs {team2Name}
          </h1>
          <p className="text-sm text-slate-500">Statut : {status}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleStart}
            disabled={status !== "Programme" || isPending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
          >
            Démarrer le match
          </button>
          <button
            onClick={handleEnd}
            disabled={status !== "En cours" || isPending}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            Terminer le match
          </button>
        </div>
      </div>

      {banner && (
        <p className={`rounded-lg px-3 py-2 text-sm ${banner.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {banner.message}
        </p>
      )}

      {locked && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Scores verrouillés : démarrez le match avant toute modification.
        </p>
      )}

      <div className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-100">
        <div className="grid grid-cols-[1fr_100px_100px] gap-2 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase text-slate-500">
          <span>Épreuve</span>
          <span className="text-center">{team1Name}</span>
          <span className="text-center">{team2Name}</span>
        </div>
        {trials.map((trial) => (
          <div key={trial.trialOrder} className="grid grid-cols-[1fr_100px_100px] items-center gap-2 px-4 py-2">
            <span className="text-sm font-medium text-slate-700">
              {trial.trialOrder}. {trial.trialName}
            </span>
            <input
              type="number"
              min={0}
              disabled={locked}
              value={trial.team1Points}
              onChange={(e) => updateTrial(trial.trialOrder, "team1Points", Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-2 py-1 text-center text-sm disabled:bg-slate-100"
            />
            <input
              type="number"
              min={0}
              disabled={locked}
              value={trial.team2Points}
              onChange={(e) => updateTrial(trial.trialOrder, "team2Points", Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-2 py-1 text-center text-sm disabled:bg-slate-100"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-6 text-lg font-black tabular-nums text-slate-800">
        <span>{totals.team1}</span>
        <span className="text-slate-300">:</span>
        <span>{totals.team2}</span>
      </div>
    </div>
  );
}
