<script setup lang="ts">
const { data } = useSocketConnection();
const state = useState<CompleteState>("state");

await callOnce("socket:init", async () => {
  state.value = await $fetch("/api/state");
});

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
</script>

<template>
  <NuxtPage />
</template>

<style>
:root {
  --font-display: "DM Serif Text", serif;
  --font-secondary: "Haettenschweiler", sans-serif;
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
  --large-scoreboard-x-padding: 40px;
  --ui-scale: 0.75;
}
</style>
