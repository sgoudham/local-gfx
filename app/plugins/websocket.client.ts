export type SharedSocketConnection = {
  data: ReturnType<typeof useWebSocket<string>>["data"];
  send: ReturnType<typeof useWebSocket<string>>["send"];
};

export default defineNuxtPlugin(() => {
  const requestURL = useRequestURL();
  const protocol = requestURL.protocol === "https:" ? "wss" : "ws";
  const ws = useWebSocket<string>(`${protocol}://${requestURL.host}/_ws`);

  return {
    provide: {
      ws: {
        data: ws.data,
        send: ws.send,
      } satisfies SharedSocketConnection,
    },
  };
});
