import type { Metadata } from "next";
import "./globals.css";
import { getStaffSession } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";

export const metadata: Metadata = {
  title: "Bible Masters — Back-office",
  description: "Espace administration et arbitrage du tournoi Bible Masters.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getStaffSession();

  return (
    <html lang="fr">
      <body>
        {session && (
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
              <a href="/dashboard" className="text-lg font-bold text-brand-700">
                Bible Masters — Back-office
              </a>
              <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
                {session.role === "admin" && (
                  <>
                    <a href="/dashboard" className="hover:text-brand-600">
                      Tournois
                    </a>
                    <a href="/matches/create" className="hover:text-brand-600">
                      Créer un match
                    </a>
                  </>
                )}
                <a href="/visibilite" className="hover:text-brand-600">
                  Visibilité
                </a>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  {session.username} · {session.role}
                </span>
                <form action={logoutAction}>
                  <button type="submit" className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold hover:bg-slate-100">
                    Déconnexion
                  </button>
                </form>
              </nav>
            </div>
          </header>
        )}
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
