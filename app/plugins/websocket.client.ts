import { Mode, PingMessage, PongMessage } from "~~/shared/utils/constants";

export type SharedSocketConnection = ReturnType<typeof useWebSocket<string>> & {
  register: (mode: Mode) => void;
  unregister: (mode: Mode) => void;
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

  const activeModes = ref(new Set<Mode>());

  const sendRegister = (mode: Mode) => {
    ws.send(
      JSON.stringify({
        mode,
        type: SocketMessage.SessionRegister,
      }),
    );
  };

  const sendUnregister = (mode: Mode) => {
    ws.send(
      JSON.stringify({
        mode,
        type: SocketMessage.SessionUnregister,
      }),
    );
  };

  watch(ws.status, (status) => {
    if (status === "OPEN") {
      for (const mode of activeModes.value) {
        sendRegister(mode);
      }
    }
  });

  useEventListener(document, "visibilitychange", () => {
    if (document.visibilityState === "visible" && ws.status.value !== "OPEN") {
      ws.open();
    }
  });

  const register = (mode: Mode) => {
    const wasAlreadyActive = activeModes.value.has(mode);
    activeModes.value.add(mode);

    if (!wasAlreadyActive && ws.status.value === "OPEN") {
      sendRegister(mode);
    }
  };

  const unregister = (mode: Mode) => {
    if (!activeModes.value.has(mode)) return;

    activeModes.value.delete(mode);
    if (ws.status.value === "OPEN") {
      sendUnregister(mode);
    }
  };

  return {
    provide: { ws: { ...ws, register, unregister } },
  };
});
