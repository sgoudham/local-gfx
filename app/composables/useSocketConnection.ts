export const useSocketConnection = () => {
  const { $ws } = useNuxtApp();
  if (!$ws) {
    throw new Error("WebSocket plugin is unavailable");
  }
  return $ws;
};
