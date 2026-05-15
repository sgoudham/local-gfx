import type { FormationKey, PenaltyState } from "../utils/constants";
import type { PlayerData, TeamData, MatchData } from "./data";

export type MatchTime = {
  paused: boolean;
  ms: number;
  formatted: string;
};

export type TeamState = {
  activeFormation: FormationKey;
  goals: PlayerData[];
  /** @minItems 5 @maxItems 5 */
  penalties: [
    PenaltyState,
    PenaltyState,
    PenaltyState,
    PenaltyState,
    PenaltyState,
  ];
};

export type OverlayState = {
  visible: boolean;
};

export type Graphics = {
  matchScorecard: OverlayState;
  penaltiesScorecard: OverlayState;
  bigMatchScorecard: OverlayState;
  teamFormation: OverlayState;
  substitution: OverlayState;
};

export type InitialState = {
  matchTime: MatchTime;
  home: TeamState;
  away: TeamState;
  graphics: Graphics;
};

export type TeamComplete = TeamData & TeamState;

export type CompleteState = MatchData & InitialState;