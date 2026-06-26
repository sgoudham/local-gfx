import type { Peer } from "crossws";
import { FundraisingInfo } from "~~/shared/types/charity";

export class Charity {
  private _fundraisingInfo!: FundraisingInfo;
  private peer: Peer | undefined;
  private pollingStarted = false;
  private readonly ONE_MINUTE_MS = 60000;

  async init() {
    this._fundraisingInfo = await this.fetchFundraisingInfo();
    return this;
  }

  fundraisingInfo(): FundraisingInfo {
    return this._fundraisingInfo;
  }

  setPeer(peer: Peer): void {
    this.peer = peer;
  }

  async publishDonationAlerts() {
    if (!this.peer) return;
    const data = JSON.stringify({
      type: SocketMessage.AlertNewDonation,
      data: this._fundraisingInfo,
    });
    this.peer.publish(Mode.Donations, data);
    this.peer.send(data);
  }

  startFundraisingInfoPolling(): void {
    if (this.pollingStarted) return;

    this.pollingStarted = true;

    const tick = async () => {
      try {
        const nextFundraisingInfo = await this.fetchFundraisingInfo();
        const hasRaisedAmountChanged =
          nextFundraisingInfo.totalRaised !== this._fundraisingInfo.totalRaised;

        this._fundraisingInfo = nextFundraisingInfo;

        console.info(
          `message="fetched donation data" prev=${this._fundraisingInfo.totalRaised} next=${nextFundraisingInfo.totalRaised}`,
        );

        if (hasRaisedAmountChanged) {
          await this.publishDonationAlerts();
        }
      } catch (error) {
        console.error("Failed to poll fundraising info", error);
      } finally {
        if (!this.pollingStarted) return;
        setTimeout(() => {
          tick();
        }, this.ONE_MINUTE_MS);
      }
    };

    tick();
  }

  async fetchFundraisingInfo(): Promise<FundraisingInfo> {
    const { justGivingApiKey } = useRuntimeConfig();
    if (!justGivingApiKey) {
      console.error(
        `message="JUSTGIVING_API_KEY not defined, not making http request"`,
      );
      return {
        totalRaised: 0,
        target: 0,
        percentage: 0,
        donationCount: 0
      };
    }

    const response = await fetch(
      "https://api.justgiving.com/v1/fundraising/pages/page/ymorzin-cup-final-26",
      {
        headers: {
          "x-api-key": justGivingApiKey,
          Accept: "application/json",
        },
      },
    );

    const data = await response.json();

    return {
      totalRaised: data.grandTotalRaisedExcludingGiftAid,
      target: data.fundraisingTarget,
      percentage: data.totalRaisedPercentageOfFundraisingTarget,
      donationCount: data.donationCount
    };
  }
}
