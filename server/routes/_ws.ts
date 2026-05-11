import {
  ControlMessageSchema,
  ModeEnvelopeSchema,
  Modes,
  OutputMessageSchema,
} from "#shared/types/socket";
import type { Message, Peer } from "crossws";
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
            const data = JSON.stringify({
              type: "state.sync",
              data: serverState.state,
            });
            peer.publish(Modes.Control, data);
            peer.send(data);
            break;
          case Overlays.MatchScorecardTimerStart:
            serverState.matchScorecard.startTimer(() => {
              syncState([Modes.Output, Modes.Control], serverState, peer);
            });
            break;
          case Overlays.MatchScorecardTimerStop:
            await serverState.matchScorecard.stopTimer();
            syncState([Modes.Output, Modes.Control], serverState, peer);
            break;
          case Overlays.MatchScorecardTimerReset:
            await serverState.matchScorecard.resetTimer();
            syncState([Modes.Output, Modes.Control], serverState, peer);
            break;
          case Overlays.MatchScorecardShow:
            await serverState.patchState((s) => {
              s.graphics.matchScorecard.visible = true;
            });
            syncState([Modes.Output, Modes.Control], serverState, peer);
            break;
          case Overlays.MatchScorecardHide:
            await serverState.patchState((s) => {
              s.graphics.matchScorecard.visible = false;
            });
            syncState([Modes.Output, Modes.Control], serverState, peer);
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

const syncState = (modes: Modes[], serverState: ServerState, peer: Peer) => {
  const data = JSON.stringify({
    type: "state.sync",
    data: serverState.state,
  });
  for (const mode of modes) {
    peer.publish(mode, data);
  }
  peer.send(data);
};

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
