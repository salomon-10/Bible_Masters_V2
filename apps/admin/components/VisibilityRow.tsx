"use client";

import { useActionState } from "react";
import { updateMatchVisibilityAction } from "@/actions/visibility";
import type { ActionState } from "@/actions/tournaments";
import type { MatchWithTeams } from "@bible-masters/shared";

const initial: ActionState = { ok: true, message: "" };

export function VisibilityRow({ match }: { match: MatchWithTeams }) {
  const [state, action, pending] = useActionState(updateMatchVisibilityAction, initial);

  return (
    <form action={action} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm">
      <input type="hidden" name="match_id" value={match.id} />

      <span className="min-w-[180px] font-medium text-slate-800">
        {match.team1Name} vs {match.team2Name}
      </span>
      <span className="text-xs text-slate-400">
        {match.scoreTeam1 ?? "–"}-{match.scoreTeam2 ?? "–"}
      </span>

      <select name="status" defaultValue={match.status} className="rounded-lg border border-slate-300 px-2 py-1 text-xs">
        <option value="Programme">Programmé</option>
        <option value="En cours">En cours</option>
        <option value="Termine">Terminé</option>
      </select>

      <label className="flex items-center gap-1 text-xs text-slate-600">
        <input type="checkbox" name="published" value="1" defaultChecked={match.published} />
        Publié
      </label>

      <button disabled={pending} className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700">
        {pending ? "..." : "Mettre à jour"}
      </button>

      {state.message && (
        <span className={state.ok ? "text-emerald-600" : "text-red-600"}>{state.message}</span>
      )}

      <a href={`/matches/${match.id}/score`} className="ml-auto text-xs font-semibold text-brand-600 hover:underline">
        Saisir les scores →
      </a>
    </form>
  );
}
