"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/actions/auth";

const initialState: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Connexion Admin</h1>
        <p className="text-sm text-slate-500">Bible Master — espace réservé au staff.</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Adresse e-mail
          <input
            type="email"
            name="email"
            required
            autoComplete="username"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Mot de passe
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
