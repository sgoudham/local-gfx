import { YcfState, YcfData, YcfDataSchema } from "../../shared/types/ycf";
import { MatchScorecardState } from "./overlays/matchScorecard";

export type StateMutator = (state: YcfState) => void;

export class ServerState {
  _state!: YcfState;
  matchScorecard!: MatchScorecardState;

  constructor() {}

  async init() {
    this._state = await this.initState();
    this.matchScorecard = new MatchScorecardState(
      this.patchState,
      this._state.matchTime,
    );
    return this;
  }

  get state(): Readonly<YcfState> {
    return this._state;
  }

  patchState = async (mutate: StateMutator) => {
    mutate(this._state);
    await this.persistState(this._state);
    return this._state;
  };

  private async initState() {
    let ycfState = await useStorage<YcfState>("fs").getItem("ycf");
    if (ycfState) {
      return ycfState;
    }

    ycfState = {
      ...(await this.getData()),
      graphics: {
        matchScorecard: {
          visible: false,
        },
        penaltiesScorecard: {
          visible: false,
        },
        bigMatchScorecard: {
          visible: false,
        },
        teamFormation: {
          visible: false,
        },
        substitution: {
          visible: false,
        },
      },
    };

    await this.persistState(ycfState);

    return ycfState;
  }

  private async persistState(state: YcfState) {
    await useStorage<YcfState>("fs").setItem("ycf", state);
  }

  private async getData(): Promise<YcfData> {
    const raw = await useStorage("assets:server").getItem("ycf.json");
    if (!raw) {
      throw new Error("err=no_data msg='can't retrieve ycf.json'");
    }
    return YcfDataSchema.parse(raw);
  }
}
