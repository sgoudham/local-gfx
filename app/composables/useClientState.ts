export const useClientState = () => {
  const state = useState<CompleteState>("state");
  const selectedPlayer = useState<Player | undefined>("client:selectedPlayer");
  const fundraisingInfo = useState<FundraisingInfo>("client:fundraisingInfo")
  return { state, selectedPlayer, fundraisingInfo };
};
