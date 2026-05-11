import { Modes } from "~~/shared/types/socket";
import { useSocketConnection } from "./useSocketConnection";

export const useControlSocket = () => {
  const { send, data } = useSocketConnection();

  send(JSON.stringify({ mode: Modes.Control, type: "session.register" }));

  const state = computed<YcfState | null>(() => {
    if (!data.value) return null;
    try {
      const parsed = JSON.parse(data.value);
      return parsed.type === "state.sync" ? parsed.data : null;
    } catch {
      return null;
    }
  });

  const publish = (type: string, data?: Record<string, unknown>) => {
    send(JSON.stringify({ mode: Modes.Control, type, ...data }));
  };

  return { publish, state };
};
