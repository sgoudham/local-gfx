import { useSocketConnection } from "./useSocketConnection";

export const useOutputSocket = () => {
  const state = useState<CompleteState>("state");

  const publish = (type: string, data?: Record<string, unknown>) => {
    if (import.meta.server) return;
    const { send } = useSocketConnection();
    send(JSON.stringify({ mode: Mode.Output, type, ...data }));
  };

  return { state, publish };
};
