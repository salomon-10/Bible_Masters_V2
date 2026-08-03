"use client";

import { useActionState } from "react";
import { createMatchAction } from "@/actions/matches";
import type { ActionState } from "@/actions/tournaments";

const initial: ActionState = { ok: true, message: "" };

export function CreateMatchForm({
  tournamentId,
  teams,
}: {
  tournamentId: number;
  teams: { id: number; name: string }[];
}) {
  const [state, action, pending] = useActionState(createMatchAction, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="tournament_id" value={tournamentId} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Équipe 1
          <select name="team1_id" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Équipe 2
          <select name="team2_id" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Phase
          <select name="phase" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" defaultValue="Poule">
            <option value="Poule">Phase de poules</option>
            <option value="Quart">Quart de finale</option>
            <option value="Demi">Demi-finale</option>
            <option value="PetiteFinale">Petite finale</option>
            <option value="Finale">Finale</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Statut initial
          <select name="status" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" defaultValue="Programme">
            <option value="Programme">Programmé</option>
            <option value="En cours">En cours</option>
            <option value="Termine">Terminé</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Date
          <input type="date" name="match_date" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Heure (optionnel)
          <input type="time" name="match_time" step={1} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
      </div>

      {state.message && (
        <p className={`rounded-lg px-3 py-2 text-sm ${state.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {state.message}
        </p>
      )}

      <button
        disabled={pending}
        className="self-start rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Création..." : "Créer le match"}
      </button>
    </form>
  );
}
