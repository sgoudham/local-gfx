import type { Peer } from "crossws";
import { MatchData } from "~~/shared/types/data";
import { Mode } from "~~/shared/utils/constants";
import { matchDataSchema } from "../schema/data";
import { initialStateSchema } from "../schema/state";
import { MatchTimer } from "./matchTimer";

export type StateMutator = (state: CompleteState) => void;

export type PatchState = (mutate: StateMutator) => Promise<CompleteState>;

export class ServerState {
  private _state!: CompleteState;
  private peer: Peer | undefined;
  matchTimer!: MatchTimer;

  constructor() {}

  async init() {
    this._state = await this.initState();
    this.matchTimer = new MatchTimer(this.patchState, this._state.matchTime);
    return this;
  }

  setPeer(peer: Peer): void {
    this.peer = peer;
  }

  clearPeer(): void {
    this.peer = undefined;
  }

  patchState = async (mutate: StateMutator): Promise<CompleteState> => {
    mutate(this._state);
    await this.persistState(this._state);
    await this.syncState([Mode.Control, Mode.Output]);
    return this._state;
  };

  async syncState(modes: Mode[]) {
    if (!this.peer) return;
    const data = JSON.stringify({
      type: SocketMessage.SessionStateSync,
      data: this._state,
    });
    for (const mode of modes) {
      this.peer.publish(mode, data);
    }
    this.peer.send(data);
  }

  private async initState() {
    let state = await useStorage<CompleteState>("fs").getItem("state");
    if (state) {
      return state;
    }

    const data = await this.getData();
    const initial = await this.getInitialState();

    state = {
      name: data.name,
      matchTime: initial.matchTime,
      graphics: initial.graphics,
      home: {
        ...data.home,
        ...initial.home,
      },
      away: {
        ...data.away,
        ...initial.away,
      },
    };

    await this.persistState(state);

    return state;
  }

  private async persistState(state: CompleteState) {
    await useStorage<CompleteState>("fs").setItem("state", state);
  }

  private async getData(): Promise<MatchData> {
    const raw = await useStorage("assets:server").getItem("data.json");
    if (!raw) {
      throw new Error("err=no_data msg='couldn't load data.json'");
    }
    return matchDataSchema.parse(raw);
  }

  private async getInitialState(): Promise<InitialState> {
    const raw = await useStorage("assets:server").getItem("initialState.json");
    if (!raw) {
      throw new Error("err=no_state msg='couldn't load initialState.json'");
    }
    return initialStateSchema.parse(raw);
  }
}
