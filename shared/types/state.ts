import { MatchEventKind } from "../utils/constants";
import type { Player, TeamLocation } from "./data";

// ts-to-zod seemingly can't resolve these types if they are defined in another file
// not happy about the duplication but unsure if there's a different way around this
export type TPenaltyState = 0 | 1 | 2;
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

export type MatchEvent =
  | GoalScoredEvent
  | SubstitutionMadeEvent
  | PenaltyShootoutEvent;
export type GoalScoredEvent = {
  type: "goalScored";
  player: Player;
  matchTime: MatchTime;
};
export type SubstitutionMadeEvent = {
  type: "substitution";
  location: TeamLocation;
  subs: PendingSub[];
  matchTime: MatchTime;
};
export type PenaltyShootoutEvent = {
  type: "penaltyShootout";
  goal: PenaltyGoal;
  slotIndex: number;
  matchTime: MatchTime;
};

export const isGoalScoredEvent = (
  event: MatchEvent,
): event is GoalScoredEvent => event.type === MatchEventKind.GoalScored;

export const isSubstitutionMadeEvent = (
  event: MatchEvent,
): event is SubstitutionMadeEvent => event.type === MatchEventKind.Substitution;

export const isPenaltyShootoutEvent = (
  event: MatchEvent,
): event is PenaltyShootoutEvent =>
  event.type === MatchEventKind.PenaltyShootout;

export type Goal = {
  player: Player;
  matchTime: MatchTime;
};

export type PenaltyGoal = {
  state: TPenaltyState;
  player: Player;
};

export type PlayerState = {
  id: string;
};

export type TeamState = {
  activeFormation: FormationKey;
  players: PlayerState[];
  substitutes: PlayerState[];
  goals: Goal[];
  penalties: PenaltyGoal[];
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
  hydrationBreak: OverlayState;
  donationUpdate: OverlayState;
};

export type InitialState = {
  matchTime: MatchTime;
  events: MatchEvent[];
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
  activeFormation: FormationKey;
  players: Player[];
  substitutes: Player[];
  goals: Goal[];
  penalties: PenaltyGoal[];
};

export type CompleteState = {
  matchTime: MatchTime;
  events: MatchEvent[];
  graphics: Graphics;
  home: TeamComplete;
  away: TeamComplete;
};
