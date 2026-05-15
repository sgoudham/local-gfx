import { useSocketConnection } from "./useSocketConnection";

export const useControlSocket = () => {
  const { send, data } = useSocketConnection();

  send(
    JSON.stringify({ mode: Mode.Control, type: SocketMessage.SessionRegister }),
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

  const publish = (type: string, data?: Record<string, unknown>) => {
    send(JSON.stringify({ mode: Mode.Control, type, ...data }));
  };

  return { publish, state };
};
