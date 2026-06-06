<script setup lang="ts">
import { SocketMessage, Overlay } from "#imports";
import ToggleOverlayButton from "./ToggleOverlayButton.vue";

const { state, publish } = useControlSocket();
const { selectedPlayer } = useClientState();

const overlayToggles = [
  {
    val: Overlay.MatchScorecard,
    name: state.value.graphics.matchScorecard.name,
    showMessage: SocketMessage.MatchScorecardShow,
    hideMessage: SocketMessage.MatchScorecardHide,
  },
  {
    val: Overlay.BigMatchScorecard,
    name: state.value.graphics.bigMatchScorecard.name,
    showMessage: SocketMessage.BigMatchScorecardShow,
    hideMessage: SocketMessage.BigMatchScorecardHide,
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
    <li class="overlay-list-item">
      <Button
        @click="toggleMatchTimer"
        :class="[hasMatchStarted ? 'hide' : 'show', 'item', 'action']"
        :label="hasMatchStarted ? 'Stop Match Timer' : 'Start Match Timer'"
      />
      <Button
        @click="publish(SocketMessage.MatchReset)"
        label="Reset"
        class="item action"
      />
    </li>
    <li
      v-for="overlay in overlayToggles"
      :key="overlay.val"
      class="overlay-list-item"
    >
      <ToggleOverlayButton v-bind="overlay" class="item" />
    </li>
    <template v-if="selectedPlayer">
      <li class="overlay-list-item">
        <div class="item">
          Selected {{ state[selectedPlayer.location].shortName }} Player:
        </div>
        <div class="item">
          <p>
            {{ selectedPlayer.number }}' {{ selectedPlayer.forename }}
            {{ selectedPlayer.surname }}
          </p>
        </div>
      </li>
      <li class="overlay-list-item">
        <Button
          @click="
            publish(SocketMessage.MatchGoalScored, {
              data: {
                player: selectedPlayer,
                matchTime: state.matchTime,
              },
            })
          "
          label="Add Goal"
          class="item action"
        />
        <Button label="Yellow Card" class="item action" />
        <Button label="Red Card" class="item action" />
      </li>
    </template>
  </ul>
</template>

<style scoped>
.overlay-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  width: 300px;
  flex-direction: column;
  gap: 2px;
}
.overlay-list-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  gap: 2px;
}
.item {
  flex-grow: 1;
  gap: 2px;
}
</style>
