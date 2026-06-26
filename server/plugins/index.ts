import { Charity } from "../service/charity";
import { ServerState } from "../service/state/index";

declare module "nitropack" {
  interface NitroApp {
    serverState: ServerState;
    charity: Charity;
  }
}

export default defineNitroPlugin(async (nitroApp) => {
  [nitroApp.serverState, nitroApp.charity] = await Promise.all([
    new ServerState().init(),
    new Charity().init(),
  ]);
});
