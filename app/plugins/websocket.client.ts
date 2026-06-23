import { Mode, PingMessage, PongMessage } from "~~/shared/utils/constants";

export type SharedSocketConnection = ReturnType<typeof useWebSocket<string>> & {
  register: (mode: Mode) => void;
};

export default defineNuxtPlugin(() => {
  const requestURL = useRequestURL();
  const protocol = requestURL.protocol === "https:" ? "wss" : "ws";
  const ws = useWebSocket<string>(`${protocol}://${requestURL.host}/_ws`, {
    heartbeat: {
      message: JSON.stringify(PingMessage),
      responseMessage: JSON.stringify(PongMessage),
      interval: 10000,
      pongTimeout: 3000,
    },
    autoReconnect: {
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      delay: (retries) => Math.min(1000 * 2 ** (retries - 1), 30000),
    },
  });

  const currentMode = ref<Mode | null>(null);

  watch(ws.status, (status) => {
    if (status === "OPEN" && currentMode.value) {
      ws.send(
        JSON.stringify({
          mode: currentMode.value,
          type: SocketMessage.SessionRegister,
        }),
      );
    }
  });

  useEventListener(document, "visibilitychange", () => {
    if (document.visibilityState === "visible" && ws.status.value !== "OPEN") {
      ws.open();
    }
  });

  const register = (mode: Mode) => {
    currentMode.value = mode;
    if (ws.status.value === "OPEN") {
      ws.send(JSON.stringify({ mode, type: SocketMessage.SessionRegister }));
    }
  };

  return {
    provide: { ws: { ...ws, register } },
  };
});
