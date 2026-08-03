import type { MatchPhase, MatchStatus, StaffRole } from "./database.types";

export type { MatchPhase, MatchStatus, StaffRole };

export interface Tournament {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface Team {
  id: number;
  tournamentId: number;
  name: string;
  logoUrl: string | null;
  poolId: number | null;
  poolName: string | null;
}

export interface Pool {
  id: number;
  tournamentId: number;
  name: string;
}

/** Match enrichi avec les noms/logos d'équipes, comme fetchMatches() en PHP. */
export interface MatchWithTeams {
  id: number;
  tournamentId: number;
  team1Id: number;
  team2Id: number;
  team1Name: string;
  team2Name: string;
  team1LogoUrl: string | null;
  team2LogoUrl: string | null;
  matchDate: string;
  matchTime: string;
  status: MatchStatus;
  phase: MatchPhase;
  trialTemplate: string;
  scoreTeam1: number | null;
  scoreTeam2: number | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MatchTrial {
  matchId: number;
  trialOrder: number;
  trialName: string;
  team1Points: number;
  team2Points: number;
}

export interface MatchChangeLog {
  id: number;
  matchId: number;
  staffUsername: string;
  action: string;
  oldStatus: MatchStatus | null;
  newStatus: MatchStatus | null;
  oldScoreTeam1: number | null;
  newScoreTeam1: number | null;
  oldScoreTeam2: number | null;
  newScoreTeam2: number | null;
  oldPublished: boolean | null;
  newPublished: boolean | null;
  createdAt: string;
}

/** Ligne de classement de poule, équivalent à fetchPoolStandings() en PHP. */
export interface StandingRow {
  teamId: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  rank: number;
}

export type PoolStandings = Record<string, StandingRow[]>;

export interface QualificationResult {
  ready: boolean;
  qualifiedTeamIds: number[];
  eliminatedTeamIds: number[];
  standings: PoolStandings;
}

export interface StaffSession {
  userId: string;
  username: string;
  role: StaffRole;
}
