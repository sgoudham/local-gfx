<script setup lang="ts">
const { state, publish } = useOutputSocket();
publish(SocketMessage.SessionRegister);
</script>

<template>
  <main class="page">
    <CommsPlayers v-bind="state.home" class="team team-home" />

    <MatchStats class="match-stats" />
    <EventTimeline v-bind="state.home" class="match-events" />

    <CommsPlayers v-bind="state.away" class="team team-away" />
  </main>
</template>

<style lang="css" scoped>
.page {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.team {
  position: relative;
  width: 20%;
  height: 100%;
}

.match-stats {
  height: 100dvh;
  width: 35%;
}

.match-events {
  width: 25%;
  height: 100dvh;
}
</style>
