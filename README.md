# cm9798

The Championship Manager 97/98 database for JavaScript and TypeScript: 19,359 players from 123 nations and 2,085 teams, with abilities, positions, attributes, stadiums and finances. It comes with typed helpers for searching and filtering.

```ts
import { findPlayers } from 'cm9798';

findPlayers({ attributes: { pace: { gte: 19 }, shooting: { gte: 19 } } });
// → Roberto Carlos, Ian Wright, Michael Owen, …
```

## Install

```sh
npm install cm9798
# or
pnpm add cm9798
```

The package ships as an ES module only. Use `import` (or dynamic `import()` from CommonJS), not `require`.

## Usage

### All players

```ts
import { players } from 'cm9798';

players.length; // 19359
```

### Search by surname

Case-insensitive substring match on `secondName`.

```ts
import { searchPlayers } from 'cm9798';

searchPlayers('owen');
// → Michael Owen (Liverpool), Gareth Owen (Wrexham), …
```

### Players at a club

Exact match on `currentClub`.

```ts
import { getPlayersByClub } from 'cm9798';

getPlayersByClub('Liverpool');
```

### A random player

```ts
import { getRandomPlayer } from 'cm9798';

getRandomPlayer();
```

### Filtering with `findPlayers`

`findPlayers` returns only the players who match **every** condition in the query.

```ts
import { findPlayers } from 'cm9798';

findPlayers({
  nation: ['Brazil', 'Argentina'],
  ability: { between: [180, 200] },
  positions: { attack: { gte: 2 } },
  attributes: {
    pace: { gt: 17 },
    shooting: 20,  // a bare number means "equals"
  },
});
```

#### Number filters

Use these on `ability`, `potential`, `reputation`, and any key in `positions` or `attributes`.

| Filter    | Matches when the value is…    | Example                    |
| --------- | ----------------------------- | -------------------------- |
| `5`       | equal to 5                    | `{ pace: 20 }`             |
| `eq`      | equal                         | `{ pace: { eq: 20 } }`     |
| `ne`      | not equal                     | `{ pace: { ne: 1 } }`      |
| `gt`      | greater than                  | `{ pace: { gt: 17 } }`     |
| `gte`     | greater than or equal         | `{ pace: { gte: 18 } }`    |
| `lt`      | less than                     | `{ pace: { lt: 5 } }`      |
| `lte`     | less than or equal            | `{ pace: { lte: 5 } }`     |
| `between` | within `[min, max]`, inclusive | `{ pace: { between: [15, 18] } }` |
| `in`      | one of the listed values      | `{ pace: { in: [18, 20] } }` |
| `notIn`   | none of the listed values     | `{ pace: { notIn: [1, 2] } }` |

You can combine filters on one field, and every one must hold:

```ts
findPlayers({ ability: { gte: 150, lt: 180, ne: 160 } });
```

Attribute and position names are typed, so a misspelled key such as `finishing` is a compile error.

#### Text filters

Use these on `firstName`, `secondName`, `nation` and `currentClub`. Pass a string for an exact match, or an array to match any of several values.

```ts
findPlayers({ nation: 'England', currentClub: ['Arsenal', 'Chelsea'] });
```

#### Missing values

A value that is `null` or missing never matches a filter. For example, some players have no recorded `potential`, so `{ potential: { gte: 0 } }` leaves them out instead of treating them as 0.

#### Filtering your own lists

`filterPlayers` and `matchesPlayer` take the same queries and work on any array of players, so you can refine a list you already have:

```ts
import { filterPlayers, getPlayersByClub, matchesPlayer } from 'cm9798';

const squad = getPlayersByClub('Milan');
filterPlayers(squad, { attributes: { marking: { gte: 18 } } });

matchesPlayer(squad[0], { ability: { gt: 190 } }); // boolean
```

## Teams

All 2,085 teams are available too. That includes national sides and special entries such as `Free Transfer` and `Retired`.

```ts
import { teams, searchTeams, findTeams, getSquad, getTeamForPlayer } from 'cm9798';
```

### Search by name

Case-insensitive substring match on a team's `name` or `shortName`.

```ts
searchTeams('united');
```

### Filtering with `findTeams`

`findTeams` uses the same number and text filters as `findPlayers`.

```ts
findTeams({
  division: 'EPR',
  stadium: { capacity: { gte: 40000 } },
});
// → Everton, Leeds United, Liverpool, Manchester United, Sheffield Wednesday

findTeams({ nation: 'Italy', reputation: { gte: 18 }, style: ['PASS', 'CONT'] });
```

| Kind   | Fields |
| ------ | ------ |
| Text   | `name`, `shortName`, `nation`, `city`, `division`, `lastDivision`, `formation`, `style`, `stadium.name` |
| Number | `reputation`, `following`, `blend`, `lastPosition`, `cash`, `transferRecord`, `stadium.capacity`, `stadium.seating` |

`filterTeams(list, query)` and `matchesTeam(team, query)` work on any array of teams, just like their player equivalents.

### Squads and clubs

```ts
const [manUtd] = findTeams({ name: 'Manchester United' });
getSquad(manUtd); // → Schmeichel, Keane, Giggs, … (45 players)

const [owen] = searchPlayers('owen');
getTeamForPlayer(owen)?.name; // → 'Liverpool'
```

A player's `currentClub` holds either the team's full name or its short name (`'Arsenal'`, but `'Man Utd'`). Both helpers check both names.

`getTeamForPlayer` returns `undefined` in two cases: the club has no team record, or its name matches more than one team (for example, there are teams called `Atlas` in Argentina and in Mexico). About 98% of players resolve to a team.

### Team data

- **`id` is not unique.** Several teams share some IDs, so look teams up by name or with `findTeams`.
- **`division`** is a short code, e.g. `'EPR'` for the English Premier League.
- **`style`** is one of `'PASS'`, `'CONT'`, `'DRCT'`, `'LONG'`, or empty.
- **`reputation`** and **`blend`** are rated from 0 to 20.
- **`shortName`** is an empty string when a team doesn't have one.

## Player data

Every player looks like this:

```ts
{
  id: 45,
  firstName: 'Paolo',
  secondName: 'Maldini',
  nation: 'Italy',
  currentClub: 'Milan',
  ability: 195,
  potential: 196,
  reputation: 195,
  positions: {
    goalkeeper: 0, sweeper: 2, defence: 2, anchor: 0, midfield: 0,
    support: 0, attack: 0, right: 0, left: 2, central: 2,
  },
  attributes: {
    adaptability: 19, aggression: 7, bigOccasion: 19, creativity: 16,
    dribbling: 12, flair: 11, heading: 18, marking: 20, offTheBall: 17,
    pace: 17, passing: 15, positioning: 20, shooting: 13, stamina: 19,
    strength: 17, tackling: 20, technique: 16,
  },
}
```

- **Attributes** are rated from 0 to 20.
- **Ability**, **potential** and **reputation** are the game's hidden ratings. The best players score close to 200.
- **Positions** shows how well a player plays each role and side. A higher number means a stronger fit.
- Some players have an empty `firstName` (e.g. Ronaldo), and some have `null` in `potential` or in individual attributes.

## TypeScript

The package includes type declarations for everything it exports:

```ts
import type { Player, PlayerQuery, Team, TeamQuery, NumberFilter, StringFilter } from 'cm9798';

const strikers: PlayerQuery = { positions: { attack: { gte: 2 } } };
```

## Development

```sh
pnpm install
pnpm build   # compiles src/ to dist/
```

## License

The source code is released under the [MIT License](LICENSE).

The player and team data was extracted from Championship Manager 97/98 and is **not** covered by the MIT License. All rights in that data belong to their respective owners. This project is not affiliated with or endorsed by Sports Interactive, Eidos, or any other rights holder of the Championship Manager series.
