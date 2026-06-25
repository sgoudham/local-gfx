import type { Mode } from "#imports";
import { useSocketConnection } from "./useSocketConnection";

export const useSocket = (mode: Mode) => {
  const ws = import.meta.client ? useSocketConnection() : null;

  const publish = (type: string, data?: Record<string, unknown>) => {
    if (!ws) return;
    ws.send(JSON.stringify({ mode, type, ...data }));
  };

  if (ws) {
    onMounted(() => ws.register(mode));
    onUnmounted(() => ws.unregister(mode));
  }

  return { publish, ws };
};
