import type { SharedSocketConnection } from "~/plugins/websocket.client";

export const useSocketConnection = () => {
  const { $ws } = useNuxtApp() as { $ws?: SharedSocketConnection };
  if (!$ws) {
    throw new Error("WebSocket plugin is unavailable");
  }
  return $ws;
};
