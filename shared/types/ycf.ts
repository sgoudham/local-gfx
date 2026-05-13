import z from "zod";

export const PenaltyState = {
  NONE: 0,
  GOAL: 1,
  MISS: 2,
} as const;
export type PenaltyState = (typeof PenaltyState)[keyof typeof PenaltyState];

export const PlayerSchema = z.object({
  forename: z.string(),
  surname: z.string(),
  number: z.number(),
  position: z.string(),
});
export type Player = z.infer<typeof PlayerSchema>;

export const GoalSchema = z.object({
  minute: z.number(),
  player: PlayerSchema,
});
export type Goal = z.infer<typeof GoalSchema>;

export const MatchTimeSchema = z.object({
  paused: z.boolean(),
  ms: z.number(),
  formatted: z.string(),
});
export type MatchTime = z.infer<typeof MatchTimeSchema>;

export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  players: z.array(PlayerSchema),
  substitutes: z.array(PlayerSchema),
  goals: z.array(GoalSchema),
  penalties: z.array(z.enum(PenaltyState)).length(5),
});
export type Team = z.infer<typeof TeamSchema>;

export const YcfDataSchema = z.object({
  name: z.string(),
  matchTime: MatchTimeSchema,
  home: TeamSchema,
  away: TeamSchema,
});
export type YcfData = z.infer<typeof YcfDataSchema>;

export const OverlaySchema = z.object({
  visible: z.boolean(),
});
export type Overlay = z.infer<typeof OverlaySchema>;

export const YcfStateSchema = YcfDataSchema.extend({
  graphics: z.object({
    matchScorecard: OverlaySchema,
    bigMatchScorecard: OverlaySchema,
    penaltiesScorecard: OverlaySchema,
    teamFormation: OverlaySchema,
    substitution: OverlaySchema,
  }),
});
export type YcfState = z.infer<typeof YcfStateSchema>;
