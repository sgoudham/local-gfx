import type { Peer } from "crossws";
import type { MatchData, Player, TeamData } from "~~/shared/types/data";
import type {
  InitialState,
  PlayerState,
  TeamComplete,
  TeamState,
} from "~~/shared/types/state";
import { Mode } from "~~/shared/utils/constants";
import { matchDataSchema } from "../../schema/data";
import { initialStateSchema } from "../../schema/state";
import { MatchTimer } from "./matchTimer";

export type StateMutator = (state: CompleteState) => void;

export type PatchState = (mutate: StateMutator) => Promise<CompleteState>;

export class ServerState {
  private _state!: CompleteState;
  private peer: Peer | undefined;
  matchTimer!: MatchTimer;

  async init() {
    this._state = await this.initState();
    this.matchTimer = new MatchTimer(this.patchState, this._state.matchTime);
    return this;
  }

  state(): CompleteState {
    return this._state;
  }

  setPeer(peer: Peer): void {
    this.peer = peer;
  }

  clearPeer(): void {
    this.peer = undefined;
  }

  patchState = async (mutate: StateMutator): Promise<CompleteState> => {
    mutate(this._state);
    await this.persistCompleteState(this._state);
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

  private async initState(): Promise<CompleteState> {
    const [data, state] = await Promise.all([
      this.loadData(),
      this.loadState(),
    ]);
    const completeState = this.mergeDataAndState(data, state);
    await this.persistCompleteState(completeState);
    return completeState;
  }

  private async loadData(): Promise<MatchData> {
    const storedData = await useStorage<MatchData>("fs").getItem("data");
    const parsedData = matchDataSchema.safeParse(storedData);
    if (parsedData.success) {
      return parsedData.data;
    }

    const initialData = await this.getInitialData();
    await useStorage<MatchData>("fs").setItem("data", initialData);
    return initialData;
  }

  private async loadState(): Promise<InitialState> {
    const storedState = await useStorage<InitialState>("fs").getItem("state");
    const parsedState = initialStateSchema.safeParse(storedState);
    if (parsedState.success) {
      return parsedState.data;
    }

    const initialState = await this.getInitialState();
    await useStorage<InitialState>("fs").setItem("state", initialState);
    return initialState;
  }

  private async persistCompleteState(state: CompleteState) {
    await Promise.all([
      useStorage<MatchData>("fs").setItem("data", this.extractData(state)),
      useStorage<InitialState>("fs").setItem("state", this.extractState(state)),
    ]);
  }

  private mergeDataAndState(
    data: MatchData,
    state: InitialState,
  ): CompleteState {
    return {
      matchTime: state.matchTime,
      graphics: state.graphics,
      home: this.mergeTeam(data.home, state.home),
      away: this.mergeTeam(data.away, state.away),
      events: state.events,
    };
  }

  private mergeTeam(data: TeamData, state: TeamState): TeamComplete {
    return {
      location: data.location,
      name: data.name,
      shortName: data.shortName,
      manager: data.manager,
      captain: data.players.find((p) => p.id === data.captain)!,
      activeFormation: state.activeFormation,
      players: this.hydratePlayers(data, state.players),
      substitutes: this.hydratePlayers(data, state.substitutes),
      goals: state.goals,
      penalties: state.penalties,
    };
  }

  private hydratePlayers(data: TeamData, players: PlayerState[]): Player[] {
    const playersById = new Map(
      data.players.map((player) => [player.id, player]),
    );

    return players.flatMap((playerState) => {
      const player = playersById.get(playerState.id);
      if (!player) return [];
      return [player];
    });
  }

  private extractData(state: CompleteState): MatchData {
    return {
      home: this.extractTeamData(state.home),
      away: this.extractTeamData(state.away),
    };
  }

  private extractTeamData(team: TeamComplete): TeamData {
    return {
      location: team.location,
      name: team.name,
      shortName: team.shortName,
      manager: team.manager,
      captain: team.captain.id,
      players: [...team.players, ...team.substitutes],
    };
  }

  private extractState(state: CompleteState): InitialState {
    return {
      matchTime: state.matchTime,
      graphics: state.graphics,
      home: this.extractTeamState(state.home),
      away: this.extractTeamState(state.away),
      events: state.events,
    };
  }

  private extractTeamState(team: TeamComplete): TeamState {
    return {
      activeFormation: team.activeFormation,
      players: team.players.map((player) => this.extractPlayerState(player)),
      substitutes: team.substitutes.map((player) =>
        this.extractPlayerState(player),
      ),
      goals: team.goals,
      penalties: team.penalties,
    };
  }

  private extractPlayerState(player: Player): PlayerState {
    return {
      id: player.id,
      number: player.number,
    };
  }

  private async getInitialData(): Promise<MatchData> {
    const raw = await useStorage("assets:server").getItem("initialData.json");
    if (!raw) {
      throw new Error("err=no_data msg='couldn't load initialData.json'");
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

  public async clear() {
    await this.matchTimer.reset();
    const [data, initialState] = await Promise.all([
      this.loadData(),
      this.getInitialState(),
    ]);

    this._state = this.mergeDataAndState(data, initialState);
    await useStorage<InitialState>("fs").setItem(
      "state",
      this.extractState(this._state),
    );
    this.matchTimer = new MatchTimer(this.patchState, this._state.matchTime);
    await this.syncState([Mode.Control, Mode.Output]);
  }
}
