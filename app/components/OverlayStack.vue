<script setup lang="ts">
import { SocketMessage, Overlay } from "#imports";

const { state, publish } = useControlSocket();

type OverlayToggleConfig = {
  key: Overlay;
  label: string;
  showMessage: string;
  hideMessage: string;
};

const overlayToggles: OverlayToggleConfig[] = [
  {
    key: Overlay.MatchScorecard,
    label: "Match Scorecard",
    showMessage: SocketMessage.MatchScorecardShow,
    hideMessage: SocketMessage.MatchScorecardHide,
  },
  {
    key: Overlay.TeamFormation,
    label: "Team Formation",
    showMessage: SocketMessage.TeamFormationShow,
    hideMessage: SocketMessage.TeamFormationHide,
  },
  {
    key: Overlay.PenaltiesScorecard,
    label: "Penalties Scorecard",
    showMessage: SocketMessage.PenaltiesScorecardShow,
    hideMessage: SocketMessage.PenaltiesScorecardHide,
  },
];

const isOverlayVisible = (key: Overlay) =>
  !!state.value?.graphics?.[key]?.visible;

const toggleOverlay = (config: OverlayToggleConfig) => {
  publish(
    isOverlayVisible(config.key) ? config.hideMessage : config.showMessage,
  );
};

const hasMatchStarted = computed(() => !state.value?.matchTime.paused);
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
      :key="overlay.key"
      class="overlay-list-item"
    >
      <button
        class="overlay-toggle"
        :class="isOverlayVisible(overlay.key) ? 'hide' : 'show'"
        @click="toggleOverlay(overlay)"
      >
        {{
          isOverlayVisible(overlay.key)
            ? `Hide ${overlay.label}`
            : `Show ${overlay.label}`
        }}
      </button>
    </li>

    <li class="overlay-list-item">
      <button
        class="overlay-toggle"
        :class="hasMatchStarted ? 'hide' : 'show'"
        @click="toggleMatchTimer"
      >
        {{ hasMatchStarted ? "Stop Match Timer" : "Start Match Timer" }}
      </button>
      <button
        class="overlay-toggle show"
        @click="publish(SocketMessage.MatchTimerReset)"
      >
        Reset
      </button>
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
.overlay-toggle {
  border: 0;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 10px;
  transition:
    filter 120ms ease,
    transform 120ms ease;
}
.overlay-toggle:hover {
  filter: brightness(1.05);
}
.overlay-toggle:active {
  transform: translateY(1px);
}
.overlay-toggle.show {
  background: #d32f2f;
}
.overlay-toggle.hide {
  background: #6b7280;
}
</style>
