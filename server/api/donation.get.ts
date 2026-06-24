export type Donation = {
  totalRaised: number;
  target: number;
  percentage: number;
};

export default defineEventHandler(async (): Promise<Donation> => {
  const apiKey = process.env.JUSTGIVING_API_KEY!;
  const response = await fetch(
    "https://api.justgiving.com/v1/fundraising/pages/page/ymorzin-cup-final-26",
    {
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
    },
  );

  const data = await response.json();

  return {
    totalRaised: data.grandTotalRaisedExcludingGiftAid,
    target: data.fundraisingTarget,
    percentage: data.totalRaisedPercentageOfFundraisingTarget,
  };
});