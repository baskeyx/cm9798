export interface Player {
  id: number;
  secondName: string;
  /** Empty string for players known by one name, e.g. Ronaldo. */
  firstName: string;

  nation: string;
  currentClub: string;

  ability: number;
  /** `null` when the game has no recorded potential for the player. */
  potential: number | null;
  reputation: number;

  positions: {
    goalkeeper: number;
    sweeper: number;
    defence: number;
    anchor: number;
    midfield: number;
    support: number;
    attack: number;

    right: number;
    left: number;
    central: number;
  };

  /** Rated 0–20. A handful of players have `null` for some attributes. */
  attributes: {
    adaptability: number | null;
    aggression: number | null;
    bigOccasion: number | null;
    creativity: number | null;
    dribbling: number | null;
    flair: number | null;
    heading: number | null;
    marking: number | null;
    offTheBall: number | null;
    pace: number | null;
    passing: number | null;
    positioning: number | null;
    shooting: number | null;
    stamina: number | null;
    strength: number | null;
    tackling: number | null;
    technique: number | null;
  };
}

export interface TeamColours {
  text: string;
  background: string;
}

export interface Team {
  /** Not unique: some ids are shared by several teams. */
  id: number;
  name: string;
  /** Empty string when the team has no short name. */
  shortName: string;

  nation: string;
  city: string;

  stadium: {
    name: string;
    capacity: number;
    seating: number;
  };

  reputation: number;
  following: number;
  blend: number;

  formation: string;
  style: string;

  division: string;
  lastDivision: string;
  lastPosition: number;

  cash: number;
  transferRecord: number;

  colours: {
    home: TeamColours;
    away: TeamColours;
  };
}
