import {
  ControlMessageSchema,
  ModeEnvelopeSchema,
  Modes,
  OutputMessageSchema,
} from "#shared/types/socket";
import type { Message } from "crossws";
import { ServerState } from "../state/index";

let _serverState: ServerState | null = null;

const getServerState = async () => {
  if (!_serverState) {
    _serverState = await new ServerState().init();
  }
  return _serverState;
};

export default defineWebSocketHandler({
  open(peer) {
    console.log(
      `event=open id=${peer.id} connected_clients=${peer.peers.size}`,
    );
  },

  async message(peer, msg) {
    console.log(`message=${msg.text()}`);

    const serverState = await getServerState();

    const parsed = parseMessage(msg);
    if (!parsed.ok) {
      console.error(parsed.error, parsed.issues);
      return;
    }

    switch (parsed.mode) {
      case Modes.Output:
        switch (parsed.msg.type) {
          case "session.register":
            peer.subscribe(Modes.Output);
            const data = JSON.stringify({
              type: "state.sync",
              data: serverState.state,
            });
            peer.publish(Modes.Output, data);
            peer.send(data);
            break;
        }
        break;
      case Modes.Control:
        switch (parsed.msg.type) {
          case "session.register":
            peer.subscribe(Modes.Control);
            break;
          case Overlays.MatchScorecardTimerStart:
            serverState.matchScorecard.startTimer(() => {
              peer.publish(
                Modes.Output,
                JSON.stringify({
                  type: "state.sync",
                  data: serverState.state,
                }),
              );
            });
            break;
          case Overlays.MatchScorecardTimerStop:
            serverState.matchScorecard.stopTimer();
            break;
          case Overlays.MatchScorecardTimerReset:
            serverState.matchScorecard.resetTimer();
            peer.publish(
              Modes.Output,
              JSON.stringify({
                type: "state.sync",
                data: serverState.state,
              }),
            );
            break;
          case Overlays.MatchScorecardShow:
            await serverState.patchState((s) => {
              s.graphics.matchScorecard.visible = true;
            });
            peer.publish(
              Modes.Output,
              JSON.stringify({
                type: "state.sync",
                data: serverState.state,
              }),
            );
            break;
          case Overlays.MatchScorecardHide:
            await serverState.patchState((s) => {
              s.graphics.matchScorecard.visible = false;
            });
            peer.publish(
              Modes.Output,
              JSON.stringify({
                type: "state.sync",
                data: serverState.state,
              }),
            );
            break;
        }
        break;
    }
  },

  close(peer, { code }) {
    console.log(
      `event=close id=${peer.id} code=${code} connected_clients=${peer.peers.size}`,
    );
    peer.unsubscribe(Modes.Control);
    peer.unsubscribe(Modes.Output);
  },

  error(peer, error) {
    console.error(`event=error id=${peer.id} error=${error}`);
  },
});

const parseMessage = (msg: Message) => {
  const json = msg.json();

  const mode = ModeEnvelopeSchema.safeParse(json);
  if (!mode.success) {
    return {
      ok: false,
      error: "invalid_control_message",
      issues: mode.error.issues,
    };
  }

  if (mode.data.mode === Modes.Control) {
    const result = ControlMessageSchema.safeParse(json);
    if (!result.success)
      return {
        ok: false,
        error: "invalid_control_message",
        issues: result.error.issues,
      };
    return { ok: true, mode: Modes.Control, msg: result.data };
  }

  const result = OutputMessageSchema.safeParse(json);
  if (!result.success)
    return {
      ok: false,
      error: "invalid_output_message",
      issues: result.error.issues,
    };
  return { ok: true, mode: Modes.Output, msg: result.data };
};
