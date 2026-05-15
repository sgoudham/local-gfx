import type { PenaltyState } from "../utils/constants";
import type { PlayerData, TeamData, MatchData } from "./data";

// ts-to-zod seemingly can't resolve these types if they are defined in another file
// not happy about the duplication but unsure if there's a different way around this
export type PenaltyState = 0 | 1 | 2;
export type FormationKey =
  | "3-4-3"
  | "3-5-2"
  | "3-4-2-1"
  | "3-6-1"
  | "4-3-3"
  | "4-4-2"
  | "4-5-1"
  | "4-4-1-1"
  | "4-3-2-1"
  | "4-2-3-1"
  | "5-4-1"
  | "5-3-2";

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
