import { useSocketConnection } from "./useSocketConnection";

export const useOutputSocket = () => {
  const state = useState<CompleteState>("state");
  const { send } = useSocketConnection();

  send(
    JSON.stringify({ mode: Mode.Output, type: SocketMessage.SessionRegister }),
  );

  return { state };
};
