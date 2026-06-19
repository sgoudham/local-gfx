import type { PenaltyState } from "../utils/constants";
import type { Player, TeamData, MatchData, TeamLocation } from "./data";

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

export type Goal = {
  player: Player;
  matchTime: MatchTime;
};

export type PlayerState = {
  id: string;
  /** @minimum 1 */
  /** @integer */
  number: number;
  x?: number;
  y?: number;
};

export type TeamState = {
  activeFormation?: FormationKey;
  players: PlayerState[];
  substitutes: PlayerState[];
  goals: Goal[];
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
  name: string;
  visible: boolean;
};

export type StartingSoonDataUpdate = {
  kickoffTime: string;
};

export type StartingSoonData = OverlayState & StartingSoonDataUpdate;

export type PendingSub = [Player, Player];

export type SubstitutionDataUpdate = {
  location: TeamLocation;
  subs: PendingSub[];
};
export type SubstitutionData = OverlayState & SubstitutionDataUpdate;

type TeamFormationDataUpdate = {
  location: TeamLocation;
};
export type TeamFormationData = OverlayState & TeamFormationDataUpdate;

export type Graphics = {
  startingSoon: StartingSoonData;
  matchScorecard: OverlayState;
  penaltiesScorecard: OverlayState;
  bigMatchScorecard: OverlayState;
  teamFormation: TeamFormationData;
  substitution: SubstitutionData;
};

export type InitialState = {
  matchTime: MatchTime;
  home: TeamState;
  away: TeamState;
  graphics: Graphics;
};

export type TeamComplete = {
  location: TeamLocation;
  name: string;
  shortName: string;
  manager: string;
  captain: Player;
  activeFormation?: FormationKey;
  players: Player[];
  substitutes: Player[];
  goals: Goal[];
  penalties: [
    PenaltyState,
    PenaltyState,
    PenaltyState,
    PenaltyState,
    PenaltyState,
  ];
};

export type CompleteState = {
  matchTime: MatchTime;
  graphics: Graphics;
  home: TeamComplete;
  away: TeamComplete;
};
