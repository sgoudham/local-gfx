import z from "zod";
import { Overlay } from "./state";

const socketMsg = <T extends string>(
  mode: Mode,
  type: T,
  extra: z.ZodRawShape = {},
) => z.object({ mode: z.literal(mode), type: z.literal(type), ...extra });

const overlayMsg = <A extends "show" | "hide">(
  overlayKey: Overlay,
  action: A,
) => `${overlayKey}.${action}` as const;

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
