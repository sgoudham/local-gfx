import { useSocketConnection } from "./useSocketConnection";

export const useOutputSocket = () => {
  const state = useState<CompleteState>("state");
  const { send } = useSocketConnection();

  const publish = (type: string, data?: Record<string, unknown>) => {
    send(JSON.stringify({ mode: Mode.Output, type, ...data }));
  };

  return { state, publish };
};
