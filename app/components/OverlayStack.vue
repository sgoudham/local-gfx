<script setup lang="ts">
import { OverlayMessage } from "~~/shared/types/socket";

const { state, publish } = useControlSocket();

const isMatchScorecardVisible = computed(
  () => state.value?.graphics?.matchScorecard?.visible,
);
function toggleMatchScorecard() {
  publish(
    isMatchScorecardVisible.value
      ? OverlayMessage.MatchScorecardHide
      : OverlayMessage.MatchScorecardShow,
  );
}

const hasMatchStarted = computed(() => !state.value?.matchTime.paused);
function toggleMatchTimer() {
  publish(
    hasMatchStarted.value
      ? OverlayMessage.MatchScorecardTimerStop
      : OverlayMessage.MatchScorecardTimerStart,
  );
}

const isPenaltiesScorecardVisible = computed(
  () => state.value?.graphics?.penaltiesScorecard.visible,
);
function togglePenaltiesScorecard() {
  publish(
    isPenaltiesScorecardVisible.value
      ? OverlayMessage.PenaltiesScorecardHide
      : OverlayMessage.PenaltiesScorecardShow,
  );
}
</script>

<template>
  <ul class="overlay-list">
    <li class="overlay-list-item">
      <button
        class="overlay-toggle"
        :class="isMatchScorecardVisible ? 'hide' : 'show'"
        @click="toggleMatchScorecard"
      >
        {{
          isMatchScorecardVisible
            ? "Hide Match Scorecard"
            : "Show Match Scorecard"
        }}
      </button>
    </li>
    <li class="overlay-list-item">
      <button
        class="overlay-toggle"
        :class="isPenaltiesScorecardVisible ? 'hide' : 'show'"
        @click="togglePenaltiesScorecard"
      >
        {{
          isPenaltiesScorecardVisible
            ? "Hide Penalties Scorecard"
            : "Show Penalties Scorecard"
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
        @click="() => publish(OverlayMessage.MatchScorecardTimerReset)"
      >
        Reset
      </button>
      <button
        class="overlay-toggle show"
        @click="() => publish(OverlayMessage.MatchScorecardTimerStart)"
      >
        Force Start
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
