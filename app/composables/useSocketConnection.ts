export const useSocketConnection = () => {
  const { $ws } = useNuxtApp();
  return $ws;
};
