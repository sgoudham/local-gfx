import { MatchTime } from "~~/shared/types/state";
import type { PatchState } from ".";

export class MatchTimer {
  private patchState: PatchState;
  private matchTime: MatchTime;
  private readonly ONE_SECOND_MS = 1000;
  private timerId: NodeJS.Timeout | null = null;

  constructor(patchState: PatchState, matchTime: MatchTime) {
    this.patchState = patchState;
    this.matchTime = matchTime;
    if (!matchTime.paused) {
      this.start();
    }
  }

  start() {
    if (this.timerId) return;
    this.timerId = setInterval(async () => {
      this.matchTime.ms += this.ONE_SECOND_MS;
      this.matchTime.formatted = this.formatMatchTime();
      this.matchTime.paused = false;
      await this.updateState();
    }, this.ONE_SECOND_MS);
  }

  async stop() {
    if (!this.timerId) return;
    clearInterval(this.timerId);
    this.timerId = null;
    this.matchTime.paused = true;
    await this.updateState();
  }

  async reset() {
    this.matchTime.ms = 0;
    this.matchTime.formatted = this.formatMatchTime();
    await this.stop();
    await this.updateState();
  }

  private async updateState() {
    await this.patchState((prev) => {
      prev.matchTime = {
        ...this.matchTime,
      };
    });
  }

  private formatMatchTime() {
    const totalSeconds = Math.floor(this.matchTime.ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
}
