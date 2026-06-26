export type TeamLocation = "home" | "away";
export type Card = "yellow" | "red";

export type Player = {
  id: string;
  forename: string;
  surname: string;
  /** @integer */
  number: number;
  cards: Card[]
  location: TeamLocation;
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
