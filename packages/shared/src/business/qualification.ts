import type { PoolStandings, QualificationResult } from "../types/domain";

export interface QualificationPool {
  id: number;
  name: string;
}

/**
 * Détermine les équipes qualifiées/éliminées pour les demi-finales.
 * Porté depuis config/repositories.php::fetchTournamentQualification().
 *
 * Règles conservées à l'identique :
 *  - Une poule est "prête" seulement si elle a au moins 4 équipes classées
 *    ET au moins 6 matchs de poule terminés (round-robin complet).
 *  - Le tournoi est "ready" seulement si TOUTES les poules sont prêtes.
 *  - Qualifiés = les 2 premiers de chaque poule ; éliminés = les 2 derniers.
 */
export function computeQualification(
  standings: PoolStandings,
  pools: QualificationPool[],
  completedPoolMatchCountByPoolId: Map<number, number>
): QualificationResult {
  const poolNames = Object.keys(standings);
  if (poolNames.length === 0) {
    return { ready: false, qualifiedTeamIds: [], eliminatedTeamIds: [], standings: {} };
  }

  const poolIdByName = new Map<string, number>(pools.map((p) => [p.name, p.id]));

  let ready = true;
  const qualified = new Set<number>();
  const eliminated = new Set<number>();

  for (const [poolName, rows] of Object.entries(standings)) {
    if (rows.length < 4) {
      ready = false;
      continue;
    }

    const poolId = poolIdByName.get(poolName) ?? 0;
    const completedMatches = poolId > 0 ? completedPoolMatchCountByPoolId.get(poolId) ?? 0 : 0;
    if (poolId <= 0 || completedMatches < 6) {
      ready = false;
      continue;
    }

    qualified.add(rows[0].teamId);
    qualified.add(rows[1].teamId);
    eliminated.add(rows[rows.length - 1].teamId);
    eliminated.add(rows[rows.length - 2].teamId);
  }

  return {
    ready,
    qualifiedTeamIds: Array.from(qualified).filter((id) => id > 0),
    eliminatedTeamIds: Array.from(eliminated).filter((id) => id > 0),
    standings,
  };
}
