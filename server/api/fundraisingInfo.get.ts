export default defineEventHandler(() => {
  const { charity } = useNitroApp();
  return charity.fundraisingInfo();
});
