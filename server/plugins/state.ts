import { Charity } from "../service/charity";
import { ServerState } from "../service/state/index";

declare module "nitropack" {
  interface NitroApp {
    serverState: ServerState;
    charity: Charity;
  }
}

export default defineNitroPlugin(async (nitroApp) => {
  nitroApp.serverState = await new ServerState().init();
  nitroApp.charity = await new Charity().init();
});
