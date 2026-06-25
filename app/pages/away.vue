<script setup lang="ts">
useSocket(Mode.Output);
const { state } = useClientState();
</script>

<template>
  <main class="page">
    <SocialMediaPlayers v-bind="state.away" />
  </main>
</template>

<style lang="css" scoped>
.page {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
}
</style>

