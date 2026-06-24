export const useClientState = () => {
  const selectedPlayer = useState<Player | undefined>("client:selectedPlayer");
  // TODO: add donations into client state here so it can be accessed anywhere, e.g. const { donations } = useClientState()
  const donations = useState<Donation | undefined>("client:donations");
  return { selectedPlayer, donations };
};
