import z from "zod";

export const PenaltyState = {
  NONE: 0,
  GOAL: 1,
  MISS: 2,
} as const;
export type PenaltyState = (typeof PenaltyState)[keyof typeof PenaltyState];

export const Overlay = {
  MatchScorecard: "matchScorecard",
  BigMatchScorecard: "bigMatchScorecard",
  PenaltiesScorecard: "penaltiesScorecard",
  TeamFormation: "teamFormation",
  Substitution: "substitution",
} as const;
export type Overlay = (typeof Overlay)[keyof typeof Overlay];

const MatchTimeSchema = z.object({
  paused: z.boolean(),
  ms: z.number(),
  formatted: z.string(),
});
export type MatchTime = z.infer<typeof MatchTimeSchema>;

const TeamStateSchema = z.object({
  goals: z.array(PlayerDataSchema),
  penalties: z.array(z.enum(PenaltyState)).length(5),
});

const OverlaySchema = z.object({
  visible: z.boolean(),
});

const GraphicsSchema = z.object({
  [Overlay.MatchScorecard]: OverlaySchema,
  [Overlay.PenaltiesScorecard]: OverlaySchema,
  [Overlay.BigMatchScorecard]: OverlaySchema,
  [Overlay.TeamFormation]: OverlaySchema,
  [Overlay.Substitution]: OverlaySchema,
});

export const InitialStateSchema = z.object({
  matchTime: MatchTimeSchema,
  home: TeamStateSchema,
  away: TeamStateSchema,
  graphics: GraphicsSchema,
});
export type InitialState = z.infer<typeof InitialStateSchema>;

export const CompleteStateSchema = z.intersection(MatchDataSchema, InitialStateSchema);
export type CompleteState = z.infer<typeof CompleteStateSchema>;
