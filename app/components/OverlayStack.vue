<script setup lang="ts">
import { SocketMessage, Overlay } from "#imports";
import ToggleOverlayButton from "./ToggleOverlayButton.vue";
import SelectedPlayer from "./SelectedPlayer.vue";

const { state, publish } = useControlSocket();
const { selectedPlayer } = useClientState();

const isDev = import.meta.dev;

const isTimerRunning = computed(() => !state.value.matchTime.paused);

const overlayToggles = computed(() => [
  {
    val: Overlay.StartingSoon,
    name: state.value.graphics.startingSoon.name,
    showMessage: SocketMessage.StartingSoonShow,
    hideMessage: SocketMessage.StartingSoonHide,
    disabled: isTimerRunning.value,
  },
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
    val: Overlay.HydrationBreak,
    name: state.value.graphics.hydrationBreak.name,
    showMessage: SocketMessage.HydrationBreakShow,
    hideMessage: SocketMessage.HydrationBreakHide,
  },
]);

const kickoffTime = ref(state.value.graphics.startingSoon.kickoffTime);
watch(
  () => state.value.graphics.startingSoon.kickoffTime,
  (value) => {
    kickoffTime.value = value;
  },
);

const toggleMatchTimer = () => {
  publish(
    isTimerRunning.value
      ? SocketMessage.MatchTimerStop
      : SocketMessage.MatchTimerStart,
  );
};
const updateKickoffTime = () => {
  publish(SocketMessage.MatchKickoffTimeUpdated, {
    data: { kickoffTime: kickoffTime.value },
  });
};
const startHalfMatchTimer = () => {
  publish(SocketMessage.MatchTimerHalfTime);
};
const matchReset = () => {
  selectedPlayer.value = undefined;
  publish(SocketMessage.MatchReset);
};
</script>

<template>
  <ul class="overlay-list">
    <li class="overlay-list-item">
      Match Time: {{ state.matchTime.formatted }}
    </li>
    <li class="overlay-list-item">
      Match Score: {{ state.home.goals.length }} - {{ state.away.goals.length }}
    </li>
    <li class="overlay-list-item">
      <p>Kickoff Time:</p>
      <input
        type="time"
        v-model="kickoffTime"
        @change="updateKickoffTime"
        class="item"
      />
    </li>
    <li class="overlay-list-item" v-if="isDev">
      <Button @click="matchReset" class="item action">Reset</Button>
    </li>
    <li class="overlay-list-item">
      <Button
        @click="toggleMatchTimer"
        :class="[isTimerRunning ? 'hide' : 'show', 'item', 'action']"
      >
        {{ isTimerRunning ? "Stop Match Timer" : "Start Match Timer" }}
      </Button>
      <Button
        @click="startHalfMatchTimer"
        :disabled="isTimerRunning"
        :class="[isTimerRunning ? 'disabled' : 'show', 'item', 'action']"
      >
        Start Half
      </Button>
    </li>
    <li class="overlay-list-item">
      <InputPenaltyShootout />
    </li>
    <li
      v-for="overlay in overlayToggles"
      :key="overlay.val"
      class="overlay-list-item"
    >
      <ToggleOverlayButton v-bind="overlay" class="item" />
    </li>
    <li class="overlay-list-item" style="margin-top: 8px">
      <SelectedPlayer />
    </li>
  </ul>
</template>

<style scoped>
.overlay-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 2px;
}
.overlay-list-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 2px;
}
.item {
  flex-grow: 1;
  gap: 2px;
}
</style>
