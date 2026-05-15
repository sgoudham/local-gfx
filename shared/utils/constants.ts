const overlayMsg = <O extends Overlay, A extends "show" | "hide" | "update">(
  overlayKey: O,
  action: A,
): `${O}.${A}` => `${overlayKey}.${action}`;

export const PenaltyState = {
  NONE: 0,
  GOAL: 1,
  MISS: 2,
} as const;

export const Formation = {
  "3-4-3": "3-4-3",
  "3-5-2": "3-5-2",
  "3-4-2-1": "3-4-2-1",
  "3-6-1": "3-6-1",
  "4-3-3": "4-3-3",
  "4-4-2": "4-4-2",
  "4-5-1": "4-5-1",
  "4-4-1-1": "4-4-1-1",
  "4-3-2-1": "4-3-2-1",
  "4-2-3-1": "4-2-3-1",
  "5-4-1": "5-4-1",
  "5-3-2": "5-3-2",
} as const;

export const TeamLocation = {
  Home: "home",
  Away: "away",
} as const;

export const Overlay = {
  MatchScorecard: "matchScorecard",
  BigMatchScorecard: "bigMatchScorecard",
  PenaltiesScorecard: "penaltiesScorecard",
  TeamFormation: "teamFormation",
  Substitution: "substitution",
} as const;
export type Overlay = (typeof Overlay)[keyof typeof Overlay];

export const Mode = {
  Control: "control",
  Output: "output",
} as const;
export type Mode = (typeof Mode)[keyof typeof Mode];

export const SocketMessage = {
  SessionRegister: "session.register",
  SessionStateSync: "session.state.sync",
  MatchTimerStart: "matchTimer.start",
  MatchTimerStop: "matchTimer.stop",
  MatchTimerReset: "matchTimer.reset",
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
} as const;
export type SocketMessage = (typeof SocketMessage)[keyof typeof SocketMessage];
