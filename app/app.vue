<script setup lang="ts">
import { useSocketConnection } from "./composables/useSocketConnection";
import { useClientState } from "./composables/useClientState";

const state = useState<CompleteState>("state");
const { donations } = useClientState();

await callOnce("socket:init", async () => {
  state.value = await $fetch("/api/state");
});

if (import.meta.client) {
  const { data } = useSocketConnection();

  watch(data, (raw) => {
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.type === SocketMessage.SessionStateSync) {
        state.value = parsed.data;
      }
    } catch {
      // ignore malformed messages
    }
  });

  const refreshDonations = async () => {
    try {
      const data = await $fetch<Donation>("/api/donation");
      console.log(data);
      donations.value = data;
    } catch (error) {
      console.error("Failed to refresh donations", error);
    }
  };

  await refreshDonations();

  const interval = setInterval(refreshDonations, 60_000);

  onUnmounted(() => {
    clearInterval(interval);
  });
}
</script>

<template>
  <NuxtPage />
</template>

<style>
:root {
  --font-display: "DM Serif Text", serif;
  --font-secondary: "Haettenschweiler", sans-serif;
  --font-subheading: "Roboto", sans-serif;
  --text-color: #dcebf4;
  --text-color-secondary: #242424;
  --muted-color: rgba(0, 0, 0, 0.35);
  --muted-text: rgba(0, 0, 0, 0.45);
  --home-colour-1: #73aed8;
  --home-colour-2: #f5f5f5;
  --home-gk-colour-1: #000000;
  --home-gk-colour-2: #eb37a9;
  --away-colour-1: #f5b53e;
  --away-colour-2: #486745;
  --away-gk-colour-1: #e2e2e2;
  --away-gk-colour-2: #2d2d2d;
  --ribbon-colour: #b1303a;
  --pen-scored: #1aa11a;
  --pen-missed: #f53e3e;
  --pitch-colour: #e9e9e9;
  --pitch-editor: #40a02b;
  --large-scoreboard-x-padding: 40px;
  --ui-scale: 0.75;
}
</style>
