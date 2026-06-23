import { useSession } from "./useSession";

export const useOutputSocket = () => useSession(Mode.Output);
