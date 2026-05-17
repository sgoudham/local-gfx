import { useSocketConnection } from "./useSocketConnection";

export const useControlSocket = () => {
  const state = useState<CompleteState>("state");
  const { send } = useSocketConnection();

  const publish = (type: string, data?: Record<string, unknown>) => {
    send(JSON.stringify({ mode: Mode.Control, type, ...data }));
  };

  return { publish, state };
};
