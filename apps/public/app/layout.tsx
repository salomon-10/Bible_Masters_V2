import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Bible Masters",
  description: "Suivez les matchs et classements du tournoi Bible Masters en direct.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-bold text-brand-700 dark:text-brand-400">
              Bible Masters
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
              <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400">
                Matchs
              </Link>
              <Link href="/equipes" className="hover:text-brand-600 dark:hover:text-brand-400">
                Équipes &amp; classement
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
