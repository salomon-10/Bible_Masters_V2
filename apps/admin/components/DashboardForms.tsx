"use client";

import { useActionState } from "react";
import { createTournamentAction, deleteTournamentAction, type ActionState } from "@/actions/tournaments";
import { createTeamAction, deleteTeamAction } from "@/actions/teams";
import { createPoolAction, attachTeamToPoolAction } from "@/actions/pools";

const initial: ActionState = { ok: true, message: "" };

function FeedbackBanner({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <p className={`rounded-lg px-3 py-2 text-sm ${state.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
      {state.message}
    </p>
  );
}

export function CreateTournamentForm() {
  const [state, action, pending] = useActionState(createTournamentAction, initial);
  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="tournament_name"
          placeholder="Nom du tournoi"
          required
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button disabled={pending} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Créer
        </button>
      </div>
      <FeedbackBanner state={state} />
    </form>
  );
}

export function DeleteTournamentForm({ tournamentId }: { tournamentId: number }) {
  const [, action] = useActionState(deleteTournamentAction, initial);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Supprimer ce tournoi et toutes ses données ?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="tournament_id" value={tournamentId} />
      <button className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
        Supprimer
      </button>
    </form>
  );
}

export function CreateTeamForm({ tournamentId }: { tournamentId: number }) {
  const [state, action, pending] = useActionState(createTeamAction, initial);
  return (
    <form action={action} className="flex flex-col gap-2" encType="multipart/form-data">
      <input type="hidden" name="selected_tournament_id" value={tournamentId} />
      <div className="flex flex-wrap gap-2">
        <input name="team_name" placeholder="Nom de l'équipe" required className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input type="file" name="team_logo" accept="image/png,image/jpeg,image/webp" className="text-sm" />
        <button disabled={pending} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Ajouter l&apos;équipe
        </button>
      </div>
      <FeedbackBanner state={state} />
    </form>
  );
}

export function DeleteTeamForm({ tournamentId, teamId }: { tournamentId: number; teamId: number }) {
  const [, action] = useActionState(deleteTeamAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="selected_tournament_id" value={tournamentId} />
      <input type="hidden" name="team_id" value={teamId} />
      <button className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
        Retirer
      </button>
    </form>
  );
}

export function CreatePoolForm({ tournamentId }: { tournamentId: number }) {
  const [state, action, pending] = useActionState(createPoolAction, initial);
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="selected_tournament_id" value={tournamentId} />
      <div className="flex gap-2">
        <input name="pool_name" placeholder="Nom de la poule (ex: Poule A)" required className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <button disabled={pending} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Créer
        </button>
      </div>
      <FeedbackBanner state={state} />
    </form>
  );
}

export function AttachTeamToPoolForm({
  tournamentId,
  pools,
  unassignedTeams,
}: {
  tournamentId: number;
  pools: { id: number; name: string }[];
  unassignedTeams: { id: number; name: string }[];
}) {
  const [state, action, pending] = useActionState(attachTeamToPoolAction, initial);

  if (unassignedTeams.length === 0 || pools.length === 0) return null;

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="selected_tournament_id" value={tournamentId} />
      <div className="flex flex-wrap gap-2">
        <select name="team_id" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {unassignedTeams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select name="pool_id" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {pools.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button disabled={pending} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Affecter à la poule
        </button>
      </div>
      <FeedbackBanner state={state} />
    </form>
  );
}
