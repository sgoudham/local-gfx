import z from "zod";

export const Modes = {
  Control: "control",
  Output: "output",
} as const;
export type Modes = (typeof Modes)[keyof typeof Modes];

const controlMsg = <T extends string>(type: T, extra: z.ZodRawShape = {}) =>
  z.object({ mode: z.literal(Modes.Control), type: z.literal(type), ...extra });

export const OverlayMessage = {
  // Match Scorecard
  MatchScorecardUpdate: "matchScorecard.update",
  MatchScorecardTimerStart: "matchScorecard.timer.start",
  MatchScorecardTimerStop: "matchScorecard.timer.stop",
  MatchScorecardTimerReset: "matchScorecard.timer.reset",
  MatchScorecardShow: "matchScorecard.show",
  MatchScorecardHide: "matchScorecard.hide",
  // Big Match Scorecard
  BigMatchScorecardShow: "bigMatchScorecard.show",
  BigMatchScorecardHide: "bigMatchScorecard.hide",
  // Penalties
  PenaltiesScorecardShow: "penalties.show",
  PenaltiesScorecardHide: "penalties.hide",
  // Team Formation
  TeamFormationShow: "teamFormation.show",
  TeamFormationHide: "teamFormation.hide",
  // Substitution
  SubstitutionShow: "substitution.show",
  SubstitutionHide: "substitution.hide",
} as const;
export type OverlayMessage =
  (typeof OverlayMessage)[keyof typeof OverlayMessage];

export const OutputMessageSchema = z.discriminatedUnion("type", [
  z.object({
    mode: z.literal(Modes.Output),
    type: z.literal("session.register"),
  }),
]);
export type OutputMessage = z.infer<typeof OutputMessageSchema>;

export const ControlMessageSchema = z.discriminatedUnion("type", [
  controlMsg("session.register"),
  controlMsg(OverlayMessage.MatchScorecardTimerStart),
  controlMsg(OverlayMessage.MatchScorecardTimerStop),
  controlMsg(OverlayMessage.MatchScorecardTimerReset),
  controlMsg(OverlayMessage.MatchScorecardShow),
  controlMsg(OverlayMessage.MatchScorecardHide),
  controlMsg(OverlayMessage.PenaltiesScorecardShow),
  controlMsg(OverlayMessage.PenaltiesScorecardHide),
]);
export type ControlMessage = z.infer<typeof ControlMessageSchema>;

export const ModeEnvelopeSchema = z.object({
  mode: z.enum([Modes.Control, Modes.Output]),
});
export type ModeEnvelope = z.infer<typeof ModeEnvelopeSchema>;
