import { Modes } from "~~/shared/types/socket";
import { useSocketConnection } from "./useSocketConnection";

export const useControlSocket = () => {
  const { send } = useSocketConnection();

  send(JSON.stringify({ mode: Modes.Control, type: "session.register" }));

  const publish = (type: string, data?: Record<string, unknown>) => {
    send(JSON.stringify({ mode: Modes.Control, type, ...data }));
  };

  return { publish };
};
