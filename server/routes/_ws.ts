import { Mode, SocketMessage } from "#imports";
import type { Message } from "crossws";
import {
  ControlMessage,
  ControlMessageSchema,
  ModeEnvelopeSchema,
  OutputMessage,
  OutputMessageSchema,
} from "../schema/socket";
import { ServerState } from "../state/index";

const serverState = await new ServerState().init();

export default defineWebSocketHandler({
  open(peer) {
    console.log(
      `event=open id=${peer.id} connected_clients=${peer.peers.size}`,
    );
  },

  async message(peer, msg) {
    console.log(`message=${msg.text()}`);

    const parsed = parseMessage(msg);
    if (!parsed.ok) {
      console.error(parsed.error, parsed.issues);
      return;
    }

    serverState.setPeer(peer);

    switch (parsed.mode) {
      case Mode.Output:
        switch (parsed.msg.type) {
          case SocketMessage.SessionRegister:
            peer.subscribe(Mode.Output);
            serverState.syncState([Mode.Output]);
            break;
        }
        break;
      case Mode.Control:
        switch (parsed.msg.type) {
          case SocketMessage.SessionRegister:
            peer.subscribe(Mode.Control);
            serverState.syncState([Mode.Control]);
            break;

          case SocketMessage.MatchTimerStart:
            serverState.matchTimer.start();
            break;
          case SocketMessage.MatchTimerStop:
            await serverState.matchTimer.stop();
            break;
          case SocketMessage.MatchTimerReset:
            await serverState.matchTimer.reset();
            break;

          case SocketMessage.MatchScorecardShow:
            await serverState.patchState((s) => {
              s.graphics.matchScorecard.visible = true;
              s.graphics.penaltiesScorecard.visible = false;
              s.graphics.teamFormation.visible = false;
            });
            break;
          case SocketMessage.MatchScorecardHide:
            await serverState.patchState((s) => {
              s.graphics.matchScorecard.visible = false;
            });
            break;

          case SocketMessage.PenaltiesScorecardShow:
            await serverState.patchState((s) => {
              s.graphics.penaltiesScorecard.visible = true;
              s.graphics.matchScorecard.visible = false;
            });
            break;
          case SocketMessage.PenaltiesScorecardHide:
            await serverState.patchState((s) => {
              s.graphics.penaltiesScorecard.visible = false;
            });
            break;

          case SocketMessage.TeamFormationShow:
            await serverState.patchState((s) => {
              s.graphics.teamFormation.visible = true;
              s.graphics.matchScorecard.visible = false;
            });
            break;
          case SocketMessage.TeamFormationHide:
            await serverState.patchState((s) => {
              s.graphics.teamFormation.visible = false;
            });
            break;

          case SocketMessage.SubstitutionShow:
            const data = parsed.msg.data;
            await serverState.patchState((s) => {
              const playerIndex = s[data.teamLocation].players.findIndex(
                (p) => p.number === data.playerOut.number,
              );
              const subIndex = s[data.teamLocation].substitutes.findIndex(
                (p) => p.number === data.subIn.number,
              );
              const player = s[data.teamLocation].players[playerIndex];
              const sub = s[data.teamLocation].substitutes[subIndex];
              if (sub) {
                s[data.teamLocation].players[playerIndex] = sub;
                s.graphics.substitution.subsIn.push(sub);
              }
              if (player) {
                s[data.teamLocation].substitutes[subIndex] = player;
                s.graphics.substitution.playersOut.push(player);
              }
              s.graphics.substitution.badgeSrc = s[data.teamLocation].badgeSrc;
              s.graphics.substitution.visible = true;
            });
            await new Promise((resolve) => setTimeout(resolve, 3500));
            await serverState.patchState(async (s) => {
              s.graphics.substitution.visible = false;
              await new Promise((resolve) => setTimeout(resolve, 200));
              s.graphics.substitution.playersOut = [];
              s.graphics.substitution.subsIn = [];
            });
            break;
        }
        break;
    }
  },

  close(peer, { code }) {
    console.log(
      `event=close id=${peer.id} code=${code} connected_clients=${peer.peers.size}`,
    );
    peer.unsubscribe(Mode.Control);
    peer.unsubscribe(Mode.Output);
  },

  error(peer, error) {
    console.error(`event=error id=${peer.id} error=${error}`);
  },
});

type ParsedMessage =
  | { ok: false; error: string; issues: unknown[] }
  | { ok: true; mode: typeof Mode.Control; msg: ControlMessage }
  | { ok: true; mode: typeof Mode.Output; msg: OutputMessage };

const parseMessage = (msg: Message): ParsedMessage => {
  const json = msg.json();

  const mode = ModeEnvelopeSchema.safeParse(json);
  if (!mode.success) {
    return {
      ok: false,
      error: "invalid_control_message",
      issues: mode.error.issues,
    };
  }

  if (mode.data.mode === Mode.Control) {
    const result = ControlMessageSchema.safeParse(json);
    if (!result.success)
      return {
        ok: false,
        error: "invalid_control_message",
        issues: result.error.issues,
      };
    return { ok: true as const, mode: Mode.Control, msg: result.data } as const;
  }

  const result = OutputMessageSchema.safeParse(json);
  if (!result.success)
    return {
      ok: false,
      error: "invalid_output_message",
      issues: result.error.issues,
    };
  return { ok: true as const, mode: Mode.Output, msg: result.data } as const;
};
