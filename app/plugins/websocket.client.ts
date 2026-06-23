import { PingMessage, PongMessage } from "~~/shared/utils/constants";

export type SharedSocketConnection = {
  data: ReturnType<typeof useWebSocket<string>>["data"];
  send: ReturnType<typeof useWebSocket<string>>["send"];
};

export default defineNuxtPlugin(() => {
  const requestURL = useRequestURL();
  const protocol = requestURL.protocol === "https:" ? "wss" : "ws";
  const ws = useWebSocket<string>(`${protocol}://${requestURL.host}/_ws`, {
    heartbeat: {
      message: JSON.stringify(PingMessage),
      responseMessage: JSON.stringify(PongMessage),
      pongTimeout: 3000,
    },
    autoReconnect: {
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      delay: (retries) => Math.min(1000 * 2 ** (retries - 1), 30000),
    },
  });

  return {
    provide: {
      ws: {
        data: ws.data,
        send: ws.send,
      } satisfies SharedSocketConnection,
    },
  };
});
