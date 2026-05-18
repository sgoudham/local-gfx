<script setup lang="ts">
import { SocketMessage, Overlay } from "#imports";
import ToggleOverlayButton from "./ToggleOverlayButton.vue";

const { state, publish } = useControlSocket();

const overlayToggles = [
  {
    val: Overlay.MatchScorecard,
    name: state.value.graphics.matchScorecard.name,
    showMessage: SocketMessage.MatchScorecardShow,
    hideMessage: SocketMessage.MatchScorecardHide,
  },
  {
    val: Overlay.PenaltiesScorecard,
    name: state.value.graphics.penaltiesScorecard.name,
    showMessage: SocketMessage.PenaltiesScorecardShow,
    hideMessage: SocketMessage.PenaltiesScorecardHide,
  },
];

const hasMatchStarted = computed(() => !state.value.matchTime.paused);
const toggleMatchTimer = () => {
  publish(
    hasMatchStarted.value
      ? SocketMessage.MatchTimerStop
      : SocketMessage.MatchTimerStart,
  );
};
</script>

<template>
  <ul class="overlay-list">
    <li
      v-for="overlay in overlayToggles"
      :key="overlay.val"
      class="overlay-list-item"
    >
      <ToggleOverlayButton v-bind="overlay" />
    </li>
    <li class="overlay-list-item">
      <Button
        @click="toggleMatchTimer"
        :class="hasMatchStarted ? 'hide' : 'show'"
        :label="hasMatchStarted ? 'Stop Match Timer' : 'Start Match Timer'"
      />
      <Button @click="publish(SocketMessage.MatchTimerReset)" label="Reset" />
    </li>
  </ul>
</template>

<style scoped>
.overlay-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.overlay-list-item {
  margin: 2px 0px;
  button {
    margin: 0px 0px 0px 2px;
  }
}
</style>
