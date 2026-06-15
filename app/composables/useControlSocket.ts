import { useSocketConnection } from "./useSocketConnection";

export const useControlSocket = () => {
  const state = useState<CompleteState>("state");

  const publish = (type: string, data?: Record<string, unknown>) => {
    if (import.meta.server) return;
    const { send } = useSocketConnection();
    send(JSON.stringify({ mode: Mode.Control, type, ...data }));
  };

  return { publish, state };
};
