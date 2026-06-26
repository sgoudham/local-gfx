<script setup lang="ts">
import { SocketMessage } from "#imports";

const { publish } = useSocket(Mode.Control);
const { state, selectedPlayer } = useClientState();

const handleGoal = () => {
  if (!selectedPlayer.value) return;
  publish(SocketMessage.MatchGoalScored, {
    data: {
      player: selectedPlayer.value,
      matchTime: state.value.matchTime,
    },
  });
};

const handleYellowCard = () => {
  if (!selectedPlayer.value) return;
  // TODO
};

const handleRedCard = () => {
  if (!selectedPlayer.value) return;
  // TODO
};
</script>

<template>
  <template v-if="selectedPlayer">
    <div class="selected-player" :data-location="selectedPlayer.location">
      <div class="player-row">
        <div class="player-line">
          {{ selectedPlayer.number }}' {{ selectedPlayer.forename }}
          {{ selectedPlayer.surname }}
        </div>
        <span class="team-label">
          {{ state[selectedPlayer.location].shortName }}
        </span>
      </div>

      <div class="actions">
        <button
          class="action-button goal"
          @click="handleGoal"
          :disabled="!selectedPlayer"
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
      </div>
    </div>
  </template>
</template>

<style lang="css" scoped>
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
  font-weight: 700;
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
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-number {
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
  height: 2em;
  border: none;
  border-radius: 0.5em;
  font-size: 1em;
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
