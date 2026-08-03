/**
 * Modèles d'épreuves par match, portés depuis config/repositories.php
 * (defaultTrials(), trialsForTemplate()).
 *
 * Le template est figé sur le match au moment de sa création
 * (matches.trial_template) : changer ce fichier n'affecte donc jamais les
 * matchs déjà créés, seulement les nouveaux — comportement identique à
 * l'original (migration 20260724_add_match_trial_templates.sql).
 */

export interface TrialDefinition {
  order: number;
  name: string;
}

const LEGACY_TRIALS: TrialDefinition[] = [
  { order: 1, name: "Tirée de l'épée" },
  { order: 2, name: "Identification" },
  { order: 3, name: "Collectives 1" },
  { order: 4, name: "Vrai ou Faux" },
  { order: 5, name: "Echelons" },
  { order: 6, name: "Collectives 2" },
];

const DEMI_2026_TRIALS: TrialDefinition[] = [
  { order: 1, name: "Tirée de l'épée" },
  { order: 2, name: "Collectives" },
  { order: 3, name: "Calcul mental" },
  { order: 4, name: "Récit verset" },
  { order: 5, name: "Découverte (oui/non)" },
  { order: 6, name: "Eclairs" },
];

export const TRIAL_TEMPLATES: Record<string, TrialDefinition[]> = {
  legacy: LEGACY_TRIALS,
  demi_2026: DEMI_2026_TRIALS,
};

export function defaultTrials(): TrialDefinition[] {
  return LEGACY_TRIALS;
}

export function trialsForTemplate(template: string): TrialDefinition[] {
  return TRIAL_TEMPLATES[template] ?? defaultTrials();
}

/** Détermine le template à figer sur un nouveau match selon sa phase. */
export function trialTemplateForPhase(phase: string): string {
  return phase === "Demi" ? "demi_2026" : "legacy";
}
