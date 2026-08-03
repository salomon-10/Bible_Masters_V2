import type { PoolStandings, StandingRow } from "../types/domain";

export interface StandingsPool {
  id: number;
  name: string;
}

export interface StandingsPoolTeam {
  poolId: number;
  teamId: number;
  teamName: string;
}

export interface StandingsMatch {
  team1Id: number;
  team2Id: number;
  scoreTeam1: number;
  scoreTeam2: number;
}

/**
 * Calcule le classement de chaque poule.
 * Porté depuis config/repositories.php::fetchPoolStandings().
 *
 * Règles conservées à l'identique :
 *  - Seuls les matchs de phase "Poule" et statut "Termine" comptent.
 *  - Un match ne compte que si les deux équipes sont dans la même poule.
 *  - Victoire = 3 pts, nul = 1 pt, défaite = 0 pt.
 *  - Tri : points desc, puis différence de buts desc, puis buts pour desc,
 *    puis ordre alphabétique du nom d'équipe.
 */
export function computePoolStandings(
  pools: StandingsPool[],
  poolTeams: StandingsPoolTeam[],
  completedPoolMatches: StandingsMatch[]
): PoolStandings {
  const poolNameById = new Map<number, string>(pools.map((p) => [p.id, p.name]));
  const teamPoolId = new Map<number, number>();

  const standings: PoolStandings = {};
  for (const pool of pools) {
    standings[pool.name] = [];
  }

  const rowsByPool = new Map<number, Map<number, StandingRow>>();
  for (const pool of pools) {
    rowsByPool.set(pool.id, new Map());
  }

  for (const pt of poolTeams) {
    if (!poolNameById.has(pt.poolId)) continue;
    teamPoolId.set(pt.teamId, pt.poolId);
    rowsByPool.get(pt.poolId)!.set(pt.teamId, {
      teamId: pt.teamId,
      team: pt.teamName,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      rank: 0,
    });
  }

  for (const match of completedPoolMatches) {
    const poolId1 = teamPoolId.get(match.team1Id);
    const poolId2 = teamPoolId.get(match.team2Id);
    if (poolId1 === undefined || poolId2 === undefined || poolId1 !== poolId2) continue;

    const rows = rowsByPool.get(poolId1);
    const row1 = rows?.get(match.team1Id);
    const row2 = rows?.get(match.team2Id);
    if (!row1 || !row2) continue;

    row1.played++;
    row2.played++;
    row1.goalsFor += match.scoreTeam1;
    row1.goalsAgainst += match.scoreTeam2;
    row2.goalsFor += match.scoreTeam2;
    row2.goalsAgainst += match.scoreTeam1;

    if (match.scoreTeam1 > match.scoreTeam2) {
      row1.won++;
      row1.points += 3;
      row2.lost++;
    } else if (match.scoreTeam2 > match.scoreTeam1) {
      row2.won++;
      row2.points += 3;
      row1.lost++;
    } else {
      row1.drawn++;
      row2.drawn++;
      row1.points += 1;
      row2.points += 1;
    }

    row1.goalDifference = row1.goalsFor - row1.goalsAgainst;
    row2.goalDifference = row2.goalsFor - row2.goalsAgainst;
  }

  for (const pool of pools) {
    const rows = Array.from(rowsByPool.get(pool.id)?.values() ?? []);
    rows.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
      if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
      return a.team.localeCompare(b.team);
    });
    rows.forEach((row, idx) => {
      row.rank = idx + 1;
    });
    standings[pool.name] = rows;
  }

  return standings;
}
