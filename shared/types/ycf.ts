export type YcfData = {
  name: string;
  teams: Record<string, Team>;
};

export type Team = {
  name: string;
  players: Player[];
};

export type Player = {
  forename: string;
  surname: string;
  number: number;
  position: string;
};

export type MatchScorecardData = {
  visible: boolean;
  matchTime: {
    ms: number;
    formatted: string;
  };
  dunGoals: number;
  malGoals: number;
};

export type YcfState = YcfData & {
  graphics: {
    matchScorecard: MatchScorecardData;
  };
};
