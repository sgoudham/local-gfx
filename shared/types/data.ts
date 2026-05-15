export type TeamLocation = "home" | "away";

export type Player = {
  forename: string;
  surname: string;
  /** @minimum 1 */
  /** @integer */
  number: number;
  x?: number;
  y?: number;
};

export type TeamData = {
  id: string;
  location: TeamLocation;
  name: string;
  shortName: string;
  badgeSrc: string;
  players: Player[];
  substitutes: Player[];
};

export type MatchData = {
  name: string;
  home: TeamData;
  away: TeamData;
};
