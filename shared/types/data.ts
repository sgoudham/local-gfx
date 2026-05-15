export type PlayerData = {
  forename: string;
  surname: string;
  /** @minimum 1 */
  /** @integer */
  number: number;
  position: string;
};

export type TeamData = {
  id: string;
  name: string;
  shortName: string;
  players: PlayerData[];
  substitutes: PlayerData[];
};

export type MatchData = {
  name: string;
  home: TeamData;
  away: TeamData;
};
