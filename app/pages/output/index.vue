<script setup lang="ts">
import { useOutputSocket } from "~/composables/useOutputSocket";
const { state } = useOutputSocket();
const matchScorecard = computed(
  () => state.value?.graphics.matchScorecard ?? null,
);
</script>

<template>
  <OverlayMatchScorecard v-if="matchScorecard" v-bind="matchScorecard" />
</template>

<style scoped>
</style>
