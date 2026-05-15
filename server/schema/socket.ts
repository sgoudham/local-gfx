import z from "zod";
import { Mode, SocketMessage } from "~~/shared/utils/constants";

const socketMsg = <T extends string>(
  mode: Mode,
  type: T,
  extra: z.ZodRawShape = {},
) => z.object({ mode: z.literal(mode), type: z.literal(type), ...extra });

export const OutputMessageSchema = z.discriminatedUnion("type", [
  socketMsg(Mode.Output, SocketMessage.SessionRegister),
]);
export type OutputMessage = z.infer<typeof OutputMessageSchema>;

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
]);
export type ControlMessage = z.infer<typeof ControlMessageSchema>;

export const ModeEnvelopeSchema = z.object({
  mode: z.enum([Mode.Control, Mode.Output]),
});
export type ModeEnvelope = z.infer<typeof ModeEnvelopeSchema>;
