import { Mode, SocketMessage } from "#imports";
import type { Message } from "crossws";
import {
  ControlMessage,
  ControlMessageSchema,
  ModeEnvelopeSchema,
  OutputMessage,
  OutputMessageSchema,
} from "../schema/socket";
import { ServerState } from "../state";

const animateMatchTimerIn = async (serverState: ServerState) => {
  await serverState.patchState((s) => {
    s.graphics.bigMatchScorecard.visible = true;
    s.graphics.matchScorecard.visible = false;
  });
  await new Promise((resolve) => setTimeout(resolve, 10500));
  await serverState.patchState((s) => {
    s.graphics.bigMatchScorecard.visible = false;
    s.graphics.matchScorecard.visible = true;
  });
};

const animateMatchTimerOut = async (serverState: ServerState) => {
  await serverState.patchState((s) => {
    s.graphics.matchScorecard.visible = false;
  });
};

export default defineWebSocketHandler({
  open(peer) {
    console.log(
      `event=open id=${peer.id} connected_clients=${peer.peers.size}`,
    );
  },

  async message(peer, msg) {
    console.log(`message=${msg.text()}`);

    const { serverState } = useNitroApp();

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
            await animateMatchTimerIn(serverState);
            break;
          case SocketMessage.MatchTimerStop:
            await serverState.matchTimer.stop();
            await animateMatchTimerOut(serverState);
            break;
          case SocketMessage.MatchTimerHalfTime:
            await serverState.matchTimer.halfTime();
            await animateMatchTimerIn(serverState);
            break;
          case SocketMessage.MatchKickoffTimeUpdated:
            const kickoffData = parsed.msg.data;
            await serverState.patchState((s) => {
              s.graphics.startingSoon.kickoffTime = kickoffData.kickoffTime;
            });
            break;
          case SocketMessage.MatchGoalScored:
            const goalScoredData = parsed.msg.data;
            await serverState.patchState((s) => {
              s[goalScoredData.player.location].goals.push(goalScoredData);
              s.events.push({ type: "goalScored", player: goalScoredData.player, matchTime: goalScoredData.matchTime });
            });
            break;
          case SocketMessage.MatchReset:
            await serverState.clear();
            break;

          case SocketMessage.ActiveFormationUpdate:
            const formationData = parsed.msg.data;
            await serverState.patchState((s) => {
              s[formationData.location].activeFormation =
                formationData.activeFormation;
              s[formationData.location].players = formationData.players;
            });
            break;

          case SocketMessage.TeamInfoUpdate:
            const teamData = parsed.msg.data;
            await serverState.patchState((s) => {
              s[teamData.location].players = teamData.players;
              s[teamData.location].substitutes = teamData.substitutes;
              s[teamData.location].manager = teamData.manager;
              s[teamData.location].captain = teamData.captain;
            });
            break;

          case SocketMessage.StartingSoonShow:
            await serverState.patchState((s) => {
              s.graphics.startingSoon.visible = true;
            });
            break;
          case SocketMessage.StartingSoonHide:
            await serverState.patchState((s) => {
              s.graphics.startingSoon.visible = false;
            });
            break;

          case SocketMessage.MatchScorecardShow:
            await serverState.patchState((s) => {
              s.graphics.matchScorecard.visible = true;
            });
            break;
          case SocketMessage.MatchScorecardHide:
            await serverState.patchState((s) => {
              s.graphics.matchScorecard.visible = false;
            });
            break;

          case SocketMessage.BigMatchScorecardShow:
            await serverState.patchState((s) => {
              s.graphics.bigMatchScorecard.visible = true;
            });
            break;
          case SocketMessage.BigMatchScorecardHide:
            await serverState.patchState((s) => {
              s.graphics.bigMatchScorecard.visible = false;
            });
            break;

          case SocketMessage.PenaltiesScorecardShow:
            await serverState.patchState((s) => {
              s.graphics.penaltiesScorecard.visible = true;
            });
            break;
          case SocketMessage.PenaltiesScorecardHide:
            await serverState.patchState((s) => {
              s.graphics.penaltiesScorecard.visible = false;
            });
            break;

          case SocketMessage.TeamFormationShow:
            const formation = parsed.msg.data;
            await serverState.patchState((s) => {
              s.graphics.teamFormation.location = formation.location;
              s.graphics.teamFormation.visible = true;
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
              for (const [subIn, playerOut] of data.subs) {
                const playerIndex = s[data.location].players.findIndex(
                  (p) => p.id === playerOut.id,
                );
                const subIndex = s[data.location].substitutes.findIndex(
                  (p) => p.id === subIn.id,
                );
                const player = s[data.location].players[playerIndex];
                const sub = s[data.location].substitutes[subIndex];
                if (sub && player) {
                  sub.x = player.x;
                  sub.y = player.y;
                  s[data.location].players[playerIndex] = sub;
                  s[data.location].substitutes[subIndex] = player;
                }
              }
              s.graphics.substitution.subs = data.subs;
              s.graphics.substitution.location = data.location;
              s.graphics.substitution.visible = true;
              s.events.push({type:"substitution", location:data.location, subs: data.subs, matchTime: s.matchTime})
            });
            await new Promise((resolve) => setTimeout(resolve, 6500));
            await serverState.patchState(async (s) => {
              s.graphics.substitution.visible = false;
              await new Promise((resolve) => setTimeout(resolve, 200));
              s.graphics.substitution.subs = [];
            });
            break;
          
          case SocketMessage.HydrationBreakShow:
            await serverState.patchState((s) => {
              s.graphics.hydrationBreak.visible = true;
            });
            break;
          
          case SocketMessage.HydrationBreakHide:
            await serverState.patchState((s) => {
              s.graphics.hydrationBreak.visible = false;
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
