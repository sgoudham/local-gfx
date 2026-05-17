import { ServerState } from "../state/index";

declare module "nitropack" {
  interface NitroApp {
    serverState: ServerState;
  }
}

export default defineNitroPlugin(async (nitroApp) => {
  nitroApp.serverState = await new ServerState().init();
});
