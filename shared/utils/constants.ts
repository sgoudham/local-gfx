const overlayMsg = <O extends Overlay, A extends "show" | "hide">(
  overlayKey: O,
  action: A,
): `${O}.${A}` => `${overlayKey}.${action}`;

export const PENALTY_SLOTS = [0, 0, 0, 0, 0];

export const PenaltyState = {
  NONE: 0,
  GOAL: 1,
  MISS: 2,
} as const;

export const Card = {
  Yellow: "yellow",
  Red: "red",
} as const;

export const Formation = {
  "3-4-3": "3-4-3",
  "3-5-2": "3-5-2",
  "4-3-3": "4-3-3",
  "4-4-2": "4-4-2",
  "4-5-1": "4-5-1",
  "4-3-2-1": "4-3-2-1",
  "5-4-1": "5-4-1",
  "5-3-2": "5-3-2",
} as const;

export const TeamLocation = {
  Home: "home",
  Away: "away",
} as const;

export const MatchEventKind = {
  GoalScored: "goalScored",
  Substitution: "substitution",
  PenaltyShootout: "penaltyShootout",
  CardGiven: "cardGiven",
} as const;
export type MatchEventType =
  (typeof MatchEventKind)[keyof typeof MatchEventKind];

export const Overlay = {
  StartingSoon: "startingSoon",
  MatchScorecard: "matchScorecard",
  BigMatchScorecard: "bigMatchScorecard",
  PenaltiesScorecard: "penaltiesScorecard",
  TeamFormation: "teamFormation",
  Substitution: "substitution",
  HydrationBreak: "hydrationBreak",
  DonationUpdate: "donationUpdate",
} as const;
export type Overlay = (typeof Overlay)[keyof typeof Overlay];

export const Mode = {
  Control: "control",
  Output: "output",
  Heartbeat: "heartbeat",
  Donations: "donations",
} as const;
export type Mode = (typeof Mode)[keyof typeof Mode];

export const PingMessage = {
  mode: Mode.Heartbeat,
  type: "ping",
} as const;

export const PongMessage = {
  mode: Mode.Heartbeat,
  type: "pong",
} as const;

export const SocketMessage = {
  AlertNewDonation: "alert.newDonation",

  SessionRegister: "session.register",
  SessionUnregister: "session.unregister",
  SessionStateSync: "session.state.sync",
  MatchTimerStart: "match.timer.start",
  MatchTimerStop: "match.timer.stop",
  MatchTimerHalfTime: "match.timer.halfTime",
  MatchKickoffTimeUpdated: "match.kickoffTime.update",
  MatchReset: "match.reset",
  MatchGoalScored: "match.goalScored",
  UndoMatchGoalScored: "undo.match.goalScored",
  MatchCardGiven: "match.cardGiven",
  MatchPenaltyShootoutUpdate: "match.penaltyShootout.update",
  ActiveFormationUpdate: "activeFormation.update",
  TeamInfoUpdate: "team.info.update",

  StartingSoonShow: overlayMsg(Overlay.StartingSoon, "show"),
  StartingSoonHide: overlayMsg(Overlay.StartingSoon, "hide"),
  MatchScorecardShow: overlayMsg(Overlay.MatchScorecard, "show"),
  MatchScorecardHide: overlayMsg(Overlay.MatchScorecard, "hide"),
  BigMatchScorecardShow: overlayMsg(Overlay.BigMatchScorecard, "show"),
  BigMatchScorecardHide: overlayMsg(Overlay.BigMatchScorecard, "hide"),
  PenaltiesScorecardShow: overlayMsg(Overlay.PenaltiesScorecard, "show"),
  PenaltiesScorecardHide: overlayMsg(Overlay.PenaltiesScorecard, "hide"),
  TeamFormationShow: overlayMsg(Overlay.TeamFormation, "show"),
  TeamFormationHide: overlayMsg(Overlay.TeamFormation, "hide"),
  SubstitutionShow: overlayMsg(Overlay.Substitution, "show"),
  SubstitutionHide: overlayMsg(Overlay.Substitution, "hide"),
  HydrationBreakShow: overlayMsg(Overlay.HydrationBreak, "show"),
  HydrationBreakHide: overlayMsg(Overlay.HydrationBreak, "hide"),
  DonationUpdateShow: overlayMsg(Overlay.DonationUpdate, "show"),
  DonationUpdateHide: overlayMsg(Overlay.DonationUpdate, "hide"),
} as const;
export type SocketMessage = (typeof SocketMessage)[keyof typeof SocketMessage];
