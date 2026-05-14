import type { Message, Peer } from "crossws";
import {
  ControlMessageSchema,
  ModeEnvelopeSchema,
  Modes,
  OutputMessageSchema,
  OverlayMessage,
} from "../../shared/types/socket";
import { ServerState } from "../state/index";

const serverState = await new ServerState().init();
const peers = new Set<Peer>();

const onTimer = () => {
  for (const peer of peers) {
    syncState([Modes.Output, Modes.Control], serverState, peer);
  }
};

serverState.matchScorecard.on("timer", onTimer);

export default defineWebSocketHandler({
  open(peer) {
    console.log(
      `event=open id=${peer.id} connected_clients=${peer.peers.size}`,
    );
    peers.add(peer);
  },

  async message(peer, msg) {
    console.log(`message=${msg.text()}`);

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
            syncState([Modes.Output], serverState, peer);
            break;
        }
        break;
      case Modes.Control:
        switch (parsed.msg.type) {
          case "session.register":
            peer.subscribe(Modes.Control);
            syncState([Modes.Control], serverState, peer);
            break;

          case OverlayMessage.MatchScorecardTimerStart:
            serverState.matchScorecard.startTimer();
            break;
          case OverlayMessage.MatchScorecardTimerStop:
            await serverState.matchScorecard.stopTimer();
            syncState([Modes.Output, Modes.Control], serverState, peer);
            break;
          case OverlayMessage.MatchScorecardTimerReset:
            await serverState.matchScorecard.resetTimer();
            syncState([Modes.Output, Modes.Control], serverState, peer);
            break;
          case OverlayMessage.MatchScorecardShow:
            await serverState.patchState((s) => {
              s.graphics.matchScorecard.visible = true;
              s.graphics.penaltiesScorecard.visible = false;
            });
            syncState([Modes.Output, Modes.Control], serverState, peer);
            break;
          case OverlayMessage.MatchScorecardHide:
            await serverState.patchState((s) => {
              s.graphics.matchScorecard.visible = false;
            });
            syncState([Modes.Output, Modes.Control], serverState, peer);
            break;

          case OverlayMessage.PenaltiesScorecardShow:
            await serverState.patchState((s) => {
              s.graphics.penaltiesScorecard.visible = true;
              s.graphics.matchScorecard.visible = false;
            });
            syncState([Modes.Output, Modes.Control], serverState, peer);
            break;
          case OverlayMessage.PenaltiesScorecardHide:
            await serverState.patchState((s) => {
              s.graphics.penaltiesScorecard.visible = false;
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
    peers.delete(peer);
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
