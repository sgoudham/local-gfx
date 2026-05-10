import z from "zod";

export const Modes = {
  Control: "control",
  Output: "output",
} as const;
export type Modes = (typeof Modes)[keyof typeof Modes];

const OverlayMatchScorecard = {
  MatchScorecardUpdate: "matchScorecard.update",
  MatchScorecardTimerStart: "matchScorecard.timer.start",
  MatchScorecardTimerStop: "matchScorecard.timer.stop",
  MatchScorecardTimerReset: "matchScorecard.reset",
  MatchScorecardShow: "matchScorecard.show",
  MatchScorecardHide: "matchScorecard.hide",
} as const;

export const Overlays = {
  ...OverlayMatchScorecard,
} as const;
export type Overlays = (typeof Overlays)[keyof typeof Overlays];

export const OutputMessageSchema = z.discriminatedUnion("type", [
  z.object({
    mode: z.literal(Modes.Output),
    type: z.literal("session.register"),
  }),
  z.object({ role: z.literal(Modes.Output), type: z.literal("state.sync") }),
]);
export type OutputMessage = z.infer<typeof OutputMessageSchema>;

export const ControlMessageSchema = z.discriminatedUnion("type", [
  z.object({
    mode: z.literal(Modes.Control),
    type: z.literal("session.register"),
  }),
  // z.object({ role: z.literal(Modes.Control), type: z.literal("scoreboard.update"), data: ScoreboardPatchSchema }),
  z.object({
    mode: z.literal(Modes.Control),
    type: z.literal(Overlays.MatchScorecardTimerStart),
  }),
  z.object({
    mode: z.literal(Modes.Control),
    type: z.literal(Overlays.MatchScorecardTimerStop),
  }),
  z.object({
    mode: z.literal(Modes.Control),
    type: z.literal(Overlays.MatchScorecardTimerReset),
  }),
  z.object({
    mode: z.literal(Modes.Control),
    type: z.literal(Overlays.MatchScorecardShow),
  }),
  z.object({
    mode: z.literal(Modes.Control),
    type: z.literal(Overlays.MatchScorecardHide),
  }),
]);
export type ControlMessage = z.infer<typeof ControlMessageSchema>;

export const ModeEnvelopeSchema = z.object({
  mode: z.enum([Modes.Control, Modes.Output]),
});
export type ModeEnvelope = z.infer<typeof ModeEnvelopeSchema>;
