import { useSocketConnection } from "./useSocketConnection";

export const useOutputSocket = () => {
  const { send, data } = useSocketConnection();

  send(JSON.stringify({ mode: Modes.Output, type: "session.register" }));

  const state = computed<YcfState | null>(() => {
    if (!data.value) return null;
    try {
      const parsed = JSON.parse(data.value);
      return parsed.type === "state.sync" ? parsed.data : null;
    } catch {
      return null;
    }
  });

  return { state };
};
