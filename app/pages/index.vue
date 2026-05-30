<script setup lang="ts">
const { state, publish } = useControlSocket();
publish(SocketMessage.SessionRegister);
</script>

<template>
  <div class="control">
    <TeamFormationEditor v-bind="state.home" />
    <OverlayStack />
    <TeamFormationEditor v-bind="state.away" />
  </div>
  <WindowFrame title="" src="/output" />
</template>

<style scoped>
.control {
  display: flex;
  flex-direction: row;
  gap: 20px;
}
</style>
