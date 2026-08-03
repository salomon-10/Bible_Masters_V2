import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bible Masters",
  description: "Suivez les matchs et classements du tournoi Bible Masters en direct.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <a href="/" className="text-lg font-bold text-brand-700">
              Bible Masters
            </a>
            <nav className="flex gap-4 text-sm font-medium text-slate-600">
              <a href="/" className="hover:text-brand-600">
                Matchs
              </a>
              <a href="/equipes" className="hover:text-brand-600">
                Équipes &amp; classement
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
