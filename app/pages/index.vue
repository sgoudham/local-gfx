<script setup lang="ts">
import type { TeamComplete } from "~~/shared/types/state";

const { state } = useControlSocket();

const teamHomeData = computed<TeamComplete | null>(() => {
  if (!state.value) {
    return null;
  }
  return state.value.home;
});

const teamAwayData = computed<TeamComplete | null>(() => {
  if (!state.value) {
    return null;
  }
  return state.value.away;
});
</script>

<template>
  <div class="control">
    <TeamFormationEditor v-if="teamHomeData" v-bind="teamHomeData" />
    <OverlayStack />
    <TeamFormationEditor v-if="teamAwayData" v-bind="teamAwayData" />
  </div>
  <WindowFrame title="LIVE" src="/output" />
</template>

<style scoped>
.control {
  display: flex;
  flex-direction: row;
  gap: 20px;
}
</style>
