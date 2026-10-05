import playerData from './players.json' with { type: 'json' };
import teamData from './teams.json' with { type: 'json' };
import type { Player, Team, TeamColours } from './types.js';
import { filterPlayers, filterTeams, type PlayerQuery, type TeamQuery } from './query.js';

export const players = playerData as Player[];
export const teams = teamData as Team[];

export function getPlayersByClub(club: string): Player[] {
  return players.filter((player) => player.currentClub === club);
}

export function searchPlayers(query: string): Player[] {
  const normalized = query.toLowerCase();

  return players.filter((player) =>
    player.secondName.toLowerCase().includes(normalized),
  );
}

export function getRandomPlayer() {
  return players[Math.floor(Math.random() * players.length)];
}

/**
 * Finds players matching every condition in the query.
 *
 * @example
 * findPlayers({
 *   nation: 'Brazil',
 *   ability: { gte: 150 },
 *   attributes: { pace: { gt: 17 }, shooting: { between: [15, 20] } },
 * });
 */
export function findPlayers(query: PlayerQuery): Player[] {
  return filterPlayers(players, query);
}

/**
 * Finds teams matching every condition in the query.
 *
 * @example
 * findTeams({ division: 'EPR', stadium: { capacity: { gte: 40000 } } });
 */
export function findTeams(query: TeamQuery): Team[] {
  return filterTeams(teams, query);
}

/** Case-insensitive substring search on a team's name or short name. */
export function searchTeams(query: string): Team[] {
  const normalized = query.toLowerCase();

  return teams.filter(
    (team) =>
      team.name.toLowerCase().includes(normalized) ||
      team.shortName.toLowerCase().includes(normalized),
  );
}

// Players record their club by either its full name or its short name
// (e.g. "Arsenal" but "Man Utd"), so both have to be checked.
function isPlayerClub(team: Team, club: string): boolean {
  return team.name === club || (team.shortName !== '' && team.shortName === club);
}

/** Returns the players whose current club is this team. */
export function getSquad(team: Team): Player[] {
  return players.filter((player) => isPlayerClub(team, player.currentClub));
}

/**
 * Returns the team a player currently plays for, or `undefined` if their
 * club has no team record or the club name matches more than one team.
 */
export function getTeamForPlayer(player: Player): Team | undefined {
  const matches = teams.filter((team) => isPlayerClub(team, player.currentClub));
  return matches.length === 1 ? matches[0] : undefined;
}

export { filterPlayers, filterTeams, matchesPlayer, matchesTeam } from './query.js';
export type { NumberFilter, PlayerQuery, StringFilter, TeamQuery } from './query.js';
export type { Player, Team, TeamColours };
