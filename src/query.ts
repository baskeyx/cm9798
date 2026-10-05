import type { Player, Team } from './types.js';

/**
 * A number on its own means equality. An object combines any of its
 * comparisons with AND, e.g. `{ gte: 15, lt: 19 }`.
 */
export type NumberFilter =
  | number
  | {
      eq?: number;
      ne?: number;
      gt?: number;
      gte?: number;
      lt?: number;
      lte?: number;
      /** Inclusive range: `[min, max]`. */
      between?: [number, number];
      in?: number[];
      notIn?: number[];
    };

/** A string means equality; an array matches any of its values. */
export type StringFilter = string | string[];

export interface PlayerQuery {
  firstName?: StringFilter;
  secondName?: StringFilter;
  nation?: StringFilter;
  currentClub?: StringFilter;

  ability?: NumberFilter;
  potential?: NumberFilter;
  reputation?: NumberFilter;

  positions?: { [K in keyof Player['positions']]?: NumberFilter };
  attributes?: { [K in keyof Player['attributes']]?: NumberFilter };
}

// Null or missing values never match, so a player without a recorded
// potential is excluded from any `potential` filter rather than treated as 0.
export function matchesNumber(value: number | null | undefined, filter: NumberFilter): boolean {
  if (typeof value !== 'number') return false;
  if (typeof filter === 'number') return value === filter;

  const { eq, ne, gt, gte, lt, lte, between } = filter;
  if (eq !== undefined && value !== eq) return false;
  if (ne !== undefined && value === ne) return false;
  if (gt !== undefined && !(value > gt)) return false;
  if (gte !== undefined && !(value >= gte)) return false;
  if (lt !== undefined && !(value < lt)) return false;
  if (lte !== undefined && !(value <= lte)) return false;
  if (between !== undefined && (value < between[0] || value > between[1])) return false;
  if (filter.in !== undefined && !filter.in.includes(value)) return false;
  if (filter.notIn !== undefined && filter.notIn.includes(value)) return false;
  return true;
}

export function matchesString(value: string | undefined, filter: StringFilter): boolean {
  if (value === undefined) return false;
  return Array.isArray(filter) ? filter.includes(value) : value === filter;
}

function matchesGroup<T extends object>(
  group: T,
  filters: { [K in keyof T]?: NumberFilter },
): boolean {
  for (const key of Object.keys(filters) as (keyof T)[]) {
    const filter = filters[key];
    if (filter === undefined) continue;
    if (!matchesNumber(group[key] as number | null | undefined, filter)) return false;
  }
  return true;
}

const STRING_KEYS = ['firstName', 'secondName', 'nation', 'currentClub'] as const;
const NUMBER_KEYS = ['ability', 'potential', 'reputation'] as const;

/** Returns true if the player satisfies every condition in the query. */
export function matchesPlayer(player: Player, query: PlayerQuery): boolean {
  for (const key of STRING_KEYS) {
    const filter = query[key];
    if (filter !== undefined && !matchesString(player[key], filter)) return false;
  }
  for (const key of NUMBER_KEYS) {
    const filter = query[key];
    if (filter !== undefined && !matchesNumber(player[key], filter)) return false;
  }
  if (query.positions && !matchesGroup(player.positions, query.positions)) return false;
  if (query.attributes && !matchesGroup(player.attributes, query.attributes)) return false;
  return true;
}

/** Filters any list of players by a query. */
export function filterPlayers(list: readonly Player[], query: PlayerQuery): Player[] {
  return list.filter((player) => matchesPlayer(player, query));
}

export interface TeamQuery {
  name?: StringFilter;
  shortName?: StringFilter;
  nation?: StringFilter;
  city?: StringFilter;
  division?: StringFilter;
  lastDivision?: StringFilter;
  formation?: StringFilter;
  style?: StringFilter;

  reputation?: NumberFilter;
  following?: NumberFilter;
  blend?: NumberFilter;
  lastPosition?: NumberFilter;
  cash?: NumberFilter;
  transferRecord?: NumberFilter;

  stadium?: {
    name?: StringFilter;
    capacity?: NumberFilter;
    seating?: NumberFilter;
  };
}

const TEAM_STRING_KEYS = [
  'name',
  'shortName',
  'nation',
  'city',
  'division',
  'lastDivision',
  'formation',
  'style',
] as const;
const TEAM_NUMBER_KEYS = [
  'reputation',
  'following',
  'blend',
  'lastPosition',
  'cash',
  'transferRecord',
] as const;

/** Returns true if the team satisfies every condition in the query. */
export function matchesTeam(team: Team, query: TeamQuery): boolean {
  for (const key of TEAM_STRING_KEYS) {
    const filter = query[key];
    if (filter !== undefined && !matchesString(team[key], filter)) return false;
  }
  for (const key of TEAM_NUMBER_KEYS) {
    const filter = query[key];
    if (filter !== undefined && !matchesNumber(team[key], filter)) return false;
  }
  const stadium = query.stadium;
  if (stadium) {
    if (stadium.name !== undefined && !matchesString(team.stadium.name, stadium.name)) return false;
    if (stadium.capacity !== undefined && !matchesNumber(team.stadium.capacity, stadium.capacity)) return false;
    if (stadium.seating !== undefined && !matchesNumber(team.stadium.seating, stadium.seating)) return false;
  }
  return true;
}

/** Filters any list of teams by a query. */
export function filterTeams(list: readonly Team[], query: TeamQuery): Team[] {
  return list.filter((team) => matchesTeam(team, query));
}
