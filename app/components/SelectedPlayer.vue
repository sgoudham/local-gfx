<script setup lang="ts">
import { SocketMessage } from "#imports";

const { state, publish } = useControlSocket();
const { selectedPlayer } = useClientState();

const placeholderPlayer: Player = {
  number: 0,
  forename: "Awaiting",
  surname: "Selection",
  location: "home",
};

const displayPlayer = computed(() => selectedPlayer.value || placeholderPlayer);
const isPlaceholderPlayer = computed(
  () => displayPlayer.value === placeholderPlayer,
);

const handleGoal = () => {
  if (isPlaceholderPlayer.value || !selectedPlayer.value) return;
  publish(SocketMessage.MatchGoalScored, {
    data: {
      player: selectedPlayer.value,
      matchTime: state.value.matchTime,
    },
  });
};

const handlePenaltyGoal = () => {
  if (isPlaceholderPlayer.value || !selectedPlayer.value) return;
  publish(SocketMessage.MatchGoalScored, {
    data: {
      player: selectedPlayer.value,
      matchTime: state.value.matchTime,
    },
  });
};

const handleYellowCard = () => {
  if (isPlaceholderPlayer.value || !selectedPlayer.value) return;
  // TODO
};

const handleRedCard = () => {
  if (isPlaceholderPlayer.value || !selectedPlayer.value) return;
  // TODO
};
</script>

<template>
  <div class="selected-player" :data-location="displayPlayer.location">
    <div class="player-row">
      <div class="player-line">
        {{ displayPlayer.number }}' {{ displayPlayer.forename }}
        {{ displayPlayer.surname }}
      </div>
      <span class="team-label">
        {{ state[displayPlayer.location].shortName }}
      </span>
    </div>

    <div class="actions">
      <button
        class="action-button goal"
        @click="handleGoal"
        :disabled="isPlaceholderPlayer"
        title="Goal"
      >
        ⚽
      </button>
      <button
        class="action-button yellow-card"
        @click="handleYellowCard"
        disabled
        title="Yellow Card"
      >
        🟨
      </button>
      <button
        class="action-button red-card"
        @click="handleRedCard"
        disabled
        title="Red Card"
      >
        🟥
      </button>
      <button
        class="action-button penalty-goal"
        @click="handlePenaltyGoal"
        :disabled="isPlaceholderPlayer"
        title="Penalty Goal"
      >
        🎯
      </button>
    </div>
  </div>
</template>

<style scoped>
.selected-player {
  --team-colour-1: var(--home-colour-1);
  --team-colour-2: var(--home-colour-2);
  --team-text-colour: var(--text-color-secondary);
  --team-gradient-deg: 0deg;
  --team-button-colour: rgba(255, 255, 255, 0.24);
  --team-button-hover-colour: rgba(255, 255, 255, 0.34);
  --team-button-active-colour: rgba(255, 255, 255, 0.28);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  padding: 12px;
  background: linear-gradient(
    var(--team-gradient-deg),
    var(--team-colour-1) 0%,
    var(--team-colour-2) 100%
  );
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  color: var(--team-text-colour);
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.selected-player[data-location="home"] {
  --team-colour-1: var(--home-colour-1);
  --team-colour-2: var(--home-colour-2);
  --team-text-colour: var(--text-color-secondary);
  --team-gradient-deg: 180deg;
}

.selected-player[data-location="away"] {
  --team-colour-1: var(--away-colour-1);
  --team-colour-2: var(--away-colour-2);
  --team-text-colour: var(--text-color);
  --team-gradient-deg: 0deg;
}

.player-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-width: 0;
}

.team-label {
  flex: 0 0 auto;
  font-size: 1.1em;
  font-weight: 700;
  letter-spacing: 0.04em;
  opacity: 0.9;
}

.number-row {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
}

.player-line {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 1.2em;
  font-weight: 600;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.95;
}

.player-number {
  font-size: 1em;
  font-weight: 700;
  line-height: 1;
  opacity: 0.9;
}

.actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  width: 100%;
}

.action-button {
  flex: 1 1 0;
  min-width: 0;
  height: 2.75em;
  border: none;
  border-radius: 0.5em;
  font-size: 1.25em;
  cursor: pointer;
  background: var(--team-button-colour);
  color: inherit;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.action-button:hover:not(:disabled) {
  background: var(--team-button-hover-colour);
}

.action-button:active:not(:disabled) {
  background: var(--team-button-active-colour);
}

.action-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
