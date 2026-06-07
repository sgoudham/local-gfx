<script setup lang="ts">
const { state, publish } = useControlSocket();
publish(SocketMessage.SessionRegister);
</script>

<template>
  <div class="layout">
    <div class="control">
      <TeamFormationEditor v-bind="state.home" />
      <OverlayStack />
      <TeamFormationEditor v-bind="state.away" />
    </div>
    <WindowFrame title="" src="/output" />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.control {
  display: flex;
  flex-direction: row;
  gap: 20px;
}
</style>
