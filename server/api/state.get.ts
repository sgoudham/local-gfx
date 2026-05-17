export default defineEventHandler(() => {
  const { serverState } = useNitroApp();
  return serverState.state();
});
