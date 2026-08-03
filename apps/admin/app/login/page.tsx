"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/actions/auth";

const initialState: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm transition-colors">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Connexion Back-office</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Bible Masters — espace réservé au staff.</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          Nom d&apos;utilisateur
          <input
            type="text"
            name="username"
            required
            autoComplete="username"
            placeholder="Ex: admin, arbitre1"
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          Mot de passe
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>

        {state.error && <p className="rounded-lg bg-red-50 dark:bg-red-950/50 px-3 py-2 text-sm text-red-600 dark:text-red-400 font-medium">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors mt-1"
        >
          {pending ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
