export type MatchScorecardProps = {
  visible: boolean;
  home: {
    shortName: string;
    goals: number;
  };
  away: {
    shortName: string;
    goals: number;
  };
  matchTime: string;
};

export type PenaltiesScorecardProps = {
  visible: boolean;
  home: {
    id: string;
    shortName: string;
    penalties: number[];
  };
  away: {
    id: string;
    shortName: string;
    penalties: number[];
  };
};
