import EventEmitter from "events";
import { MatchTime, YcfState } from "~~/shared/types/ycf";
import { StateMutator } from "..";

export class MatchScorecardState extends EventEmitter {
  private patchState;
  private readonly ONE_SECOND_MS = 1000;
  private timerId: NodeJS.Timeout | null = null;
  private elapsedMs;

  constructor(
    patchState: (mutate: StateMutator) => Promise<YcfState>,
    matchTimeData: MatchTime,
  ) {
    super();
    this.patchState = patchState;
    this.elapsedMs = matchTimeData.ms;
    if (!matchTimeData.paused) {
      this.startTimer();
    }
  }

  startTimer() {
    if (this.timerId) return;
    this.timerId = setInterval(async () => {
      this.elapsedMs += this.ONE_SECOND_MS;
      await this.updateState(false);
      this.emit("timer");
    }, this.ONE_SECOND_MS);
  }

  async updateState(paused: boolean) {
    await this.patchState((s) => {
      s.matchTime = {
        paused,
        ms: this.elapsedMs,
        formatted: this.formatMatchTime(this.elapsedMs),
      };
    });
  }

  async stopTimer() {
    if (!this.timerId) return;
    clearInterval(this.timerId);
    this.timerId = null;
    await this.updateState(true);
  }

  async resetTimer() {
    this.elapsedMs = 0;
    await this.stopTimer();
    await this.updateState(true);
  }

  formatMatchTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
}
