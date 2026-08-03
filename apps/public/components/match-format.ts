import type { MatchStatus, MatchWithTeams } from "@bible-masters/shared";

/** Porté depuis user/index.php::scoreText(). */
export function scoreText(match: Pick<MatchWithTeams, "scoreTeam1" | "scoreTeam2">): string {
  if (match.scoreTeam1 === null || match.scoreTeam2 === null) return "Score non disponible";
  return `${match.scoreTeam1} - ${match.scoreTeam2}`;
}

/** Porté depuis user/index.php::statusClass(). */
export function statusClass(status: MatchStatus): "live" | "upcoming" | "done" {
  if (status === "En cours") return "live";
  if (status === "Termine") return "done";
  return "upcoming";
}

export function statusLabel(status: MatchStatus): string {
  if (status === "En cours") return "En direct";
  if (status === "Termine") return "Terminé";
  return "À venir";
}

export function phaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    Poule: "Phase de poules",
    Quart: "Quart de finale",
    Demi: "Demi-finale",
    PetiteFinale: "Petite finale",
    Finale: "Finale",
  };
  return labels[phase] ?? phase;
}
