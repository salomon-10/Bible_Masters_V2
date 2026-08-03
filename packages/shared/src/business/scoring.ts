import type { MatchStatus } from "../types/domain";

export type ScoringActionResult = { ok: true } | { ok: false; error: string; retryable: boolean };

/**
 * Vérifie qu'un match peut passer de "Programme" à "En cours".
 * Porté depuis admin/set_score.php (action "start_match").
 */
export function canStartMatch(currentStatus: MatchStatus): ScoringActionResult {
  if (currentStatus !== "Programme") {
    return {
      ok: false,
      retryable: false,
      error:
        currentStatus === "Termine"
          ? "Ce match est déjà terminé : impossible de le redémarrer."
          : "Ce match est déjà en cours.",
    };
  }
  return { ok: true };
}

/**
 * Vérifie qu'un match peut passer de "En cours" à "Termine".
 * Porté depuis admin/set_score.php (action "end_match").
 */
export function canEndMatch(currentStatus: MatchStatus): ScoringActionResult {
  if (currentStatus !== "En cours") {
    return { ok: false, retryable: false, error: "Impossible de terminer : le match doit être en cours." };
  }
  return { ok: true };
}

/**
 * Vérifie qu'une épreuve peut être modifiée (autosave ou saisie manuelle).
 * Porté depuis admin/set_score.php (actions "autosave_trial"/"save_trial") :
 * les scores sont verrouillés tant que le match n'est pas "En cours".
 */
export function canEditTrial(
  currentStatus: MatchStatus,
  trialOrder: number,
  team1Points: number,
  team2Points: number
): ScoringActionResult {
  if (trialOrder <= 0) return { ok: false, retryable: false, error: "Épreuve invalide." };
  if (!Number.isInteger(team1Points) || !Number.isInteger(team2Points) || team1Points < 0 || team2Points < 0) {
    return { ok: false, retryable: false, error: "Valeurs invalides." };
  }
  if (currentStatus !== "En cours") {
    return {
      ok: false,
      retryable: false,
      error: "Scores verrouillés : démarrez le match avant toute modification.",
    };
  }
  return { ok: true };
}

/** Somme les points de toutes les épreuves pour obtenir le score total du match. */
export function computeMatchTotalsFromTrials(
  trials: Array<{ team1Points: number; team2Points: number }>
): { team1: number; team2: number } {
  return trials.reduce(
    (acc, t) => ({
      team1: acc.team1 + Math.max(0, t.team1Points),
      team2: acc.team2 + Math.max(0, t.team2Points),
    }),
    { team1: 0, team2: 0 }
  );
}
