import { useSession } from "./useSession";

export const useControlSocket = () => useSession(Mode.Control);
