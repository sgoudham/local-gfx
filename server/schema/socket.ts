import z from "zod";
import { Mode, SocketMessage } from "~~/shared/utils/constants";
import { playerSchema, teamLocationSchema } from "./data";
import {
  formationKeySchema,
  goalSchema,
  substitutionDataUpdateSchema,
} from "./state";

function socketMsg<M extends Mode, T extends string>(
  mode: M,
  type: T,
): z.ZodObject<{ mode: z.ZodLiteral<M>; type: z.ZodLiteral<T> }>;

function socketMsg<M extends Mode, T extends string, E extends z.ZodRawShape>(
  mode: M,
  type: T,
  extra: E,
): z.ZodObject<{ mode: z.ZodLiteral<M>; type: z.ZodLiteral<T> } & E>;

function socketMsg<M extends Mode, T extends string, E extends z.ZodRawShape>(
  mode: M,
  type: T,
  extra?: E,
) {
  const base = z.object({ mode: z.literal(mode), type: z.literal(type) });
  return extra ? base.extend(extra) : base;
}

export const OutputMessageSchema = z.discriminatedUnion("type", [
  socketMsg(Mode.Output, SocketMessage.SessionRegister),
]);
export type OutputMessage = z.infer<typeof OutputMessageSchema>;

const ActiveFormationUpdateSchema = z.object({
  activeFormation: formationKeySchema,
  location: teamLocationSchema,
  players: z.array(playerSchema),
});

const TeamFormationShowSchema = z.object({
  location: teamLocationSchema,
});

export const ControlMessageSchema = z.discriminatedUnion("type", [
  socketMsg(Mode.Control, SocketMessage.SessionRegister),
  socketMsg(Mode.Control, SocketMessage.MatchTimerStart),
  socketMsg(Mode.Control, SocketMessage.MatchTimerStop),
  socketMsg(Mode.Control, SocketMessage.MatchReset),
  socketMsg(Mode.Control, SocketMessage.MatchGoalScored, {
    data: goalSchema,
  }),
  socketMsg(Mode.Control, SocketMessage.ActiveFormationUpdate, {
    data: ActiveFormationUpdateSchema,
  }),
  socketMsg(Mode.Control, SocketMessage.MatchScorecardShow),
  socketMsg(Mode.Control, SocketMessage.MatchScorecardHide),
  socketMsg(Mode.Control, SocketMessage.BigMatchScorecardShow),
  socketMsg(Mode.Control, SocketMessage.BigMatchScorecardHide),
  socketMsg(Mode.Control, SocketMessage.PenaltiesScorecardShow),
  socketMsg(Mode.Control, SocketMessage.PenaltiesScorecardHide),
  socketMsg(Mode.Control, SocketMessage.TeamFormationShow, {
    data: TeamFormationShowSchema,
  }),
  socketMsg(Mode.Control, SocketMessage.TeamFormationHide),
  socketMsg(Mode.Control, SocketMessage.SubstitutionShow, {
    data: substitutionDataUpdateSchema,
  }),
  socketMsg(Mode.Control, SocketMessage.SubstitutionHide),
]);
export type ControlMessage = z.infer<typeof ControlMessageSchema>;

export const ModeEnvelopeSchema = z.object({
  mode: z.enum([Mode.Control, Mode.Output]),
});
export type ModeEnvelope = z.infer<typeof ModeEnvelopeSchema>;
