import type { MatchPhase, MatchStatus } from "../types/domain";

export const ALLOWED_MATCH_STATUSES: MatchStatus[] = ["Programme", "En cours", "Termine"];
export const ALLOWED_MATCH_PHASES: MatchPhase[] = ["Poule", "Quart", "Demi", "PetiteFinale", "Finale"];

export interface CreateMatchInput {
  tournamentId: number;
  team1Id: number;
  team2Id: number;
  matchDate: string; // YYYY-MM-DD
  matchTime: string; // HH:MM:SS
  status: MatchStatus;
  phase: MatchPhase;
}

export interface SemiMatchResult {
  team1Id: number;
  team2Id: number;
  scoreTeam1: number;
  scoreTeam2: number;
}

/** Contexte pré-chargé depuis la base, nécessaire pour valider les règles de phase. */
export interface CreateMatchContext {
  /** true si les deux équipes appartiennent bien à `tournamentId`. */
  teamsBelongToTournament: boolean;
  /** Nombre de poules dans le tournoi (0 = "mode legacy sans poule"). */
  poolCount: number;
  /** true si team1 et team2 sont dans la même poule. */
  teamsInSamePool: boolean;
  /** id de la poule des deux équipes (si trouvée). */
  poolId: number | null;
  /** nb de matchs de poule déjà programmés/joués pour cette poule (max 6). */
  poolMatchCount: number;
  /** true si cette affiche (dans un sens ou l'autre) existe déjà en phase Poule. */
  pairAlreadyExistsInPool: boolean;
  /** Résultat de qualification courant du tournoi (phase Demi). */
  qualification: { ready: boolean; qualifiedTeamIds: number[] };
  /** Nombre de demi-finales déjà créées. */
  semiCount: number;
  /** true si l'une des deux équipes est déjà engagée dans une demi-finale. */
  teamAlreadyInSemi: boolean;
  /** Les 2 demi-finales terminées (requis pour Finale/PetiteFinale). */
  completedSemiMatches: SemiMatchResult[];
  /** Nombre de matchs déjà créés dans la phase demandée (Finale/PetiteFinale). */
  existingMatchCountForPhase: number;
}

export type MatchValidationResult = { ok: true } | { ok: false; error: string };

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}:\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime());
}

/**
 * Valide la création d'un match selon les règles exactes de
 * config/repositories.php::createMatch(). Fonction pure : ne fait aucun
 * accès base de données (le contexte est pré-chargé par l'appelant), ce qui
 * la rend testable indépendamment de Supabase.
 */
export function validateMatchCreation(
  input: CreateMatchInput,
  ctx: CreateMatchContext
): MatchValidationResult {
  const { tournamentId, team1Id, team2Id, matchDate, matchTime, status, phase } = input;

  if (tournamentId <= 0) return { ok: false, error: "Tournoi invalide pour la création du match." };
  if (team1Id <= 0 || team2Id <= 0) return { ok: false, error: "Veuillez sélectionner deux équipes valides." };
  if (team1Id === team2Id) return { ok: false, error: "Les deux équipes doivent être différentes." };
  if (!isValidIsoDate(matchDate)) return { ok: false, error: "Date de match invalide. Format attendu : YYYY-MM-DD." };
  if (!TIME_RE.test(matchTime.trim())) return { ok: false, error: "Heure de match invalide. Format attendu : HH:MM:SS." };
  if (!ALLOWED_MATCH_STATUSES.includes(status)) return { ok: false, error: "Statut de match invalide." };
  if (!ALLOWED_MATCH_PHASES.includes(phase)) return { ok: false, error: "Phase de match invalide." };
  if (!ctx.teamsBelongToTournament) {
    return { ok: false, error: "Les équipes sélectionnées ne sont pas rattachées à ce tournoi." };
  }

  if (phase === "Poule") {
    const legacyNoPoolMode = ctx.poolCount === 0;

    if (!legacyNoPoolMode && !ctx.teamsInSamePool) {
      return { ok: false, error: "En phase Poule, les deux équipes doivent appartenir à la même poule." };
    }
    if (!legacyNoPoolMode && ctx.poolId === null) {
      return { ok: false, error: "Poule introuvable pour les équipes sélectionnées." };
    }
    if (!legacyNoPoolMode && ctx.poolMatchCount >= 6) {
      return { ok: false, error: "Le calendrier de cette poule est déjà complet (6 matchs)." };
    }
    if (!legacyNoPoolMode && ctx.pairAlreadyExistsInPool) {
      return { ok: false, error: "Cette affiche existe déjà dans la phase de poule." };
    }
  }

  if (phase === "Demi") {
    if (!ctx.qualification.ready) {
      return { ok: false, error: "Les demi-finales ne sont pas disponibles : terminez la phase de poules." };
    }
    if (!ctx.qualification.qualifiedTeamIds.includes(team1Id) || !ctx.qualification.qualifiedTeamIds.includes(team2Id)) {
      return { ok: false, error: "Seules les équipes qualifiées peuvent jouer les demi-finales." };
    }
    if (ctx.semiCount >= 2) {
      return { ok: false, error: "Le tableau des demi-finales est déjà complet." };
    }
    if (ctx.teamAlreadyInSemi) {
      return { ok: false, error: "Une des équipes est déjà engagée dans une demi-finale." };
    }
  }

  if (phase === "Finale" || phase === "PetiteFinale") {
    if (ctx.completedSemiMatches.length !== 2) {
      return { ok: false, error: "Finale/Petite finale indisponible : 2 demi-finales terminées sont requises." };
    }

    const winners: number[] = [];
    const losers: number[] = [];
    for (const semi of ctx.completedSemiMatches) {
      if (semi.scoreTeam1 === semi.scoreTeam2) {
        return {
          ok: false,
          error: "Impossible de générer finale/petite finale : une demi-finale est terminée sur égalité.",
        };
      }
      const winner = semi.scoreTeam1 > semi.scoreTeam2 ? semi.team1Id : semi.team2Id;
      const loser = semi.scoreTeam1 > semi.scoreTeam2 ? semi.team2Id : semi.team1Id;
      winners.push(winner);
      losers.push(loser);
    }

    const expected = (phase === "Finale" ? winners : losers).slice().sort((a, b) => a - b);
    const selected = [team1Id, team2Id].slice().sort((a, b) => a - b);
    if (expected[0] !== selected[0] || expected[1] !== selected[1]) {
      return {
        ok: false,
        error:
          phase === "Finale"
            ? "La finale doit opposer les deux vainqueurs des demi-finales."
            : "La petite finale doit opposer les deux perdants des demi-finales.",
      };
    }

    if (ctx.existingMatchCountForPhase >= 1) {
      return {
        ok: false,
        error: phase === "Finale" ? "La finale existe déjà pour ce tournoi." : "La petite finale existe déjà pour ce tournoi.",
      };
    }
  }

  return { ok: true };
}

/** Détermine le score initial d'un nouveau match, selon son statut. */
export function initialScoresForStatus(status: MatchStatus): { scoreTeam1: number | null; scoreTeam2: number | null } {
  return status === "Programme" ? { scoreTeam1: null, scoreTeam2: null } : { scoreTeam1: 0, scoreTeam2: 0 };
}
