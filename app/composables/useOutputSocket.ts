import { useSocketConnection } from "./useSocketConnection";

export const useOutputSocket = () => {
  const { send, data } = useSocketConnection();

  send(
    JSON.stringify({ mode: Mode.Output, type: SocketMessage.SessionRegister }),
  );

  const state = computed<CompleteState | null>(() => {
    if (!data.value) return null;
    try {
      const parsed = JSON.parse(data.value);
      return parsed.type === SocketMessage.SessionStateSync
        ? parsed.data
        : null;
    } catch {
      return null;
    }
  });

  return { state };
};
