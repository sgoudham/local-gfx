<template>
  <div class="control">
    <TeamFormationEditor />
    <OverlayStack />
    <TeamFormationEditor />
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
