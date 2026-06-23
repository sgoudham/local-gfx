<script setup lang="ts">
const { state } = useOutputSocket();
</script>

<template>
  <main class="page">
    <SocialMediaPlayers v-bind="state.home" />
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
