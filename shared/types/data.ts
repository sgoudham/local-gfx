export type TeamLocation = "home" | "away";

export type Player = {
  id: string;
  forename: string;
  surname: string;
  /** @minimum 1 */
  /** @integer */
  number: number;
  location: TeamLocation;
  x?: number;
  y?: number;
};

export type TeamData = {
  location: TeamLocation;
  name: string;
  shortName: string;
  players: Player[];
  manager: string;
  captain: string;
};

export type MatchData = {
  home: TeamData;
  away: TeamData;
};
