import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getStaffSession } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Bible Masters — Back-office",
  description: "Espace administration et arbitrage du tournoi Bible Masters.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getStaffSession();

  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/dashboard" className="text-lg font-bold text-brand-700 dark:text-brand-400">
              Bible Masters — Back-office
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
              {session && (
                <>
                  {session.role === "admin" && (
                    <>
                      <Link href="/dashboard" className="hover:text-brand-600 dark:hover:text-brand-400">
                        Tournois
                      </Link>
                      <Link href="/matches/create" className="hover:text-brand-600 dark:hover:text-brand-400">
                        Créer un match
                      </Link>
                    </>
                  )}
                  <Link href="/visibilite" className="hover:text-brand-600 dark:hover:text-brand-400">
                    Visibilité
                  </Link>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {session.username} · {session.role}
                  </span>
                  <form action={logoutAction}>
                    <button type="submit" className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">
                      Déconnexion
                    </button>
                  </form>
                </>
              )}
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
