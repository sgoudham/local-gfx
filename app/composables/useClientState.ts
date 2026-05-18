export const useClientState = () => {
  const selectedPlayer = useState<Player | undefined>("client:selectedPlayer");
  return { selectedPlayer };
};
