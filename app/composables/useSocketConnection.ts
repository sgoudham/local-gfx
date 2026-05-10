const { data, send } = useWebSocket("ws://localhost:3000/_ws");

export const useSocketConnection = () => {
  return { data, send };
};
