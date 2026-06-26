<script setup lang="ts">
import type { TeamLocation } from "~~/shared/types/data.js";

type PendingSubListProps = {
  location: TeamLocation;
  subs: PendingSub[];
};

const props = defineProps<PendingSubListProps>();

const emit = defineEmits<{
  cancel: [index: number];
}>();

const { state } = useClientState();

const teamName = computed(() => state.value[props.location].shortName);

const formatPlayer = (player: Player) =>
  `${player.number} ${player.forename} ${player.surname}`;
const formatSubstitution = (sub: PendingSub) =>
  `▼ ${formatPlayer(sub[1])} | ▲ ${formatPlayer(sub[0])}`;
</script>

<template>
  <div class="pending-subs" :data-location="location">
    <div class="pending-header">
      <span class="pending-label">{{ subs.length }} pending</span>
      <span class="team-label">{{ teamName }}</span>
    </div>

    <ul class="pending-list">
      <li
        v-for="(item, index) in subs"
        :key="`${item[0].id}-${item[1].id}-${index}`"
        class="pending-item"
      >
        <span class="pending-text" :title="formatSubstitution(item)">
          <span class="pending-off">▼ {{ formatPlayer(item[1]) }}</span>
          <span class="pending-divider">|</span>
          <span class="pending-on">▲ {{ formatPlayer(item[0]) }}</span>
        </span>
        <Button
          class="pending-cancel"
          title="Cancel pending sub"
          @click="emit('cancel', index)"
        >
          x
        </Button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.pending-subs {
  --team-colour-1: var(--home-colour-1);
  --team-colour-2: var(--home-colour-2);
  --team-text-colour: var(--text-color-secondary);
  --team-gradient-deg: 180deg;
  --team-button-colour: rgba(255, 255, 255, 0.24);
  --team-button-hover-colour: rgba(255, 255, 255, 0.34);
  --team-button-active-colour: rgba(255, 255, 255, 0.28);

  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  min-width: 0;
  padding: 8px;
  border-radius: 8px;
  box-sizing: border-box;
  background: linear-gradient(
    var(--team-gradient-deg),
    var(--team-colour-1) 0%,
    var(--team-colour-2) 100%
  );
  color: var(--team-text-colour);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.pending-subs[data-location="home"] {
  --team-colour-1: var(--home-colour-1);
  --team-colour-2: var(--home-colour-2);
  --team-text-colour: var(--text-color-secondary);
  --team-gradient-deg: 180deg;
}

.pending-subs[data-location="away"] {
  --team-colour-1: var(--away-colour-1);
  --team-colour-2: var(--away-colour-2);
  --team-text-colour: var(--text-color);
  --team-gradient-deg: 0deg;
}

.pending-header {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.team-label {
  font-size: 1em;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.pending-label {
  font-size: 0.8em;
  font-weight: 600;
}

.pending-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 108px;
  overflow-y: auto;
}

.pending-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  padding: 3px 3px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.091);
}

.pending-text {
  min-width: 0;
  font-size: 0.75em;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pending-off,
.pending-on {
  font-weight: 600;
}

.pending-divider {
  margin: 0 0.35em;
}

.pending-cancel {
  border: none;
  border-radius: 0.5em;
  width: 1.8em;
  height: 1.8em;
  min-height: 1.8em;
  padding: 0;
  font-size: 0.85em;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  background: var(--team-button-colour);
  color: inherit;
  transition: background 0.2s ease;
}

.pending-cancel:hover {
  background: var(--team-button-hover-colour);
}

.pending-cancel:active {
  background: var(--team-button-active-colour);
}
</style>
