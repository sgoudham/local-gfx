import z from "zod";
import { Mode, SocketMessage } from "~~/shared/utils/constants";
import { teamLocationSchema, playerSchema } from "./data";

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

// TODO: Potentially remove in favour of the generated object if we make the
// control panel send an array of subbed in/out players.
const SubstitutionUpdateSchema = z.object({
  teamLocation: teamLocationSchema,
  playerOut: playerSchema,
  subIn: playerSchema,
});

export const ControlMessageSchema = z.discriminatedUnion("type", [
  socketMsg(Mode.Control, SocketMessage.SessionRegister),
  socketMsg(Mode.Control, SocketMessage.MatchTimerStart),
  socketMsg(Mode.Control, SocketMessage.MatchTimerStop),
  socketMsg(Mode.Control, SocketMessage.MatchTimerReset),
  socketMsg(Mode.Control, SocketMessage.MatchScorecardShow),
  socketMsg(Mode.Control, SocketMessage.MatchScorecardHide),
  socketMsg(Mode.Control, SocketMessage.PenaltiesScorecardShow),
  socketMsg(Mode.Control, SocketMessage.PenaltiesScorecardHide),
  socketMsg(Mode.Control, SocketMessage.TeamFormationShow),
  socketMsg(Mode.Control, SocketMessage.TeamFormationHide),
  socketMsg(Mode.Control, SocketMessage.SubstitutionShow, {
    data: SubstitutionUpdateSchema,
  }),
  socketMsg(Mode.Control, SocketMessage.SubstitutionHide),
]);
export type ControlMessage = z.infer<typeof ControlMessageSchema>;

export const ModeEnvelopeSchema = z.object({
  mode: z.enum([Mode.Control, Mode.Output]),
});
export type ModeEnvelope = z.infer<typeof ModeEnvelopeSchema>;
