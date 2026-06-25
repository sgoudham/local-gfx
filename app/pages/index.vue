<script setup lang="ts">
const { state } = useControlSocket();
const isDev = import.meta.dev;
</script>

<template>
  <div class="layout">
    <WindowFrame v-if="isDev" src="/output" class="frame" />
    <div class="control">
      <TeamFormationEditor v-bind="state.home" />
      <OverlayStack />
      <TeamFormationEditor v-bind="state.away" />
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.frame {
  display: flex;
  align-self: center;
  width: 500px;
}
.control {
  display: flex;
  flex-direction: row;
  gap: 20px;
}
</style>
