import z from "zod";

export const PlayerDataSchema = z.object({
  forename: z.string(),
  surname: z.string(),
  number: z.number().int().positive(),
  position: z.string(),
});
export type PlayerData = z.infer<typeof PlayerDataSchema>;

export const TeamDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  players: z.array(PlayerDataSchema),
  substitutes: z.array(PlayerDataSchema),
});
export type TeamData = z.infer<typeof TeamDataSchema>;

export const MatchDataSchema = z.object({
  name: z.string(),
  home: TeamDataSchema,
  away: TeamDataSchema,
});
export type MatchData = z.infer<typeof MatchDataSchema>;

