import type { PendingSubs } from "~/types";

export const useClientState = () => {
  const state = useState<CompleteState>("client:state");
  const selectedPlayer = useState<Player | undefined>("client:selectedPlayer");
  const fundraisingInfo = useState<FundraisingInfo>("client:fundraisingInfo");
  const pendingSubs = useState<PendingSubs>("client:pendingSubs", () => {
    return {
      home: [],
      away: [],
    };
  });
  return { state, selectedPlayer, fundraisingInfo, pendingSubs };
};
