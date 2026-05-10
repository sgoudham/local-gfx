import { YcfState } from "~~/shared/types/ycf";
import { StateMutator } from "..";

export class MatchScorecardState {
  private patchState;
  private readonly ONE_SECOND_MS = 1000;
  private timerId: number | null = null;
  private elapsedMs;

  constructor(patchState: (mutate: StateMutator) => Promise<YcfState>, elapsedMs: number) {
    this.patchState = patchState;
    this.elapsedMs = elapsedMs;
  }

  startTimer(onTick: () => void) {
    if (this.timerId) return;
    this.timerId = setInterval(async () => {
      this.elapsedMs += this.ONE_SECOND_MS;
      await this.updateState();
      onTick();
    }, this.ONE_SECOND_MS);
  }

  async updateState() {
    await this.patchState((s) => {
      s.graphics.matchScorecard.matchTime = {
        ms: this.elapsedMs,
        formatted: this.formatMatchTime(this.elapsedMs),
      };
    });
  }

  stopTimer() {
    if (!this.timerId) return;
    clearInterval(this.timerId);
    this.timerId = null;
  }

  resetTimer() {
    this.elapsedMs = 0;
    this.stopTimer();
    this.updateState();
  }

  formatMatchTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
}
