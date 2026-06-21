<script setup lang="ts">
import type { EditTeamFormProps } from "~/types";
import { VueDraggable } from "vue-draggable-plus";

const props = defineProps<EditTeamFormProps>();

const emit = defineEmits<{
  save: [
    players: Player[],
    substitutes: Player[],
    manager: string,
    captain: Player,
  ];
}>();

const MAX_PLAYERS = 11;

const draftPlayers = ref<Player[]>([]);
const draftSubs = ref<Player[]>([]);
const draftManager = ref("");
const draftCaptain = ref<Player>(props.captain);

function resetData() {
  draftPlayers.value = props.players
    .map((p) => ({ ...p }))
    .filter((p) => p.forename !== "");
  draftSubs.value = props.substitutes
    .map((p) => ({ ...p }))
    .filter((p) => p.forename !== "");
  draftManager.value = `${props.manager}`;
  draftCaptain.value = draftPlayers.value.find(
    (player) => player.id === props.captain.id,
  )!;
}

watch(
  () => [
    props.location,
    props.players,
    props.substitutes,
    props.manager,
    props.captain,
  ],
  resetData,
  { immediate: true, deep: true },
);

const tooManyOrNotEnoughPlayers = computed(
  () => draftPlayers.value.length !== MAX_PLAYERS,
);

function handleSubmit() {
  emit(
    "save",
    draftPlayers.value,
    draftSubs.value,
    draftManager.value,
    draftCaptain.value,
  );
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="field-row">
      <h3 class="field-label">Manager:</h3>
      <input
        type="text"
        v-model="draftManager"
        class="field-control"
        @keydown.enter.prevent
      />
    </div>

    <div class="field-row">
      <h3 class="field-label">Captain:</h3>
      <select
        name="captain"
        id="captain"
        v-model="draftCaptain"
        class="field-control"
      >
        <option :value="player" v-for="player in draftPlayers">
          {{ player.number }}' {{ player.forename }} {{ player.surname }}
        </option>
      </select>
    </div>

    <section class="squad-section">
      <h3 :class="{ warn: tooManyOrNotEnoughPlayers }">
        Starting XI ({{ draftPlayers.length }}/{{ MAX_PLAYERS }})
      </h3>
      <VueDraggable
        v-model="draftPlayers"
        group="squad"
        :animation="150"
        item-key="id"
        tag="ul"
        class="list"
        :class="{ 'list--invalid': tooManyOrNotEnoughPlayers }"
        handle=".drag-handle"
      >
        <li v-for="player in draftPlayers" :key="player.id" class="player-row">
          <span class="drag-handle">⠿</span>
          <input
            type="number"
            v-model.number="player.number"
            class="number-input"
            min="1"
            @keydown.enter.prevent
          />
          <span class="player-name"
            >{{ player.forename }} {{ player.surname }}</span
          >
        </li>
      </VueDraggable>
    </section>

    <section class="squad-section">
      <h3>Substitutes</h3>
      <VueDraggable
        v-model="draftSubs"
        group="squad"
        :animation="150"
        item-key="id"
        tag="ul"
        class="list"
        handle=".drag-handle"
      >
        <li v-for="player in draftSubs" :key="player.id" class="player-row">
          <span class="drag-handle">⠿</span>
          <input
            type="number"
            v-model.number="player.number"
            class="number-input"
            min="1"
            @keydown.enter.prevent
          />
          <span class="player-name"
            >{{ player.forename }} {{ player.surname }}</span
          >
        </li>
      </VueDraggable>
    </section>

    <button
      type="submit"
      :disabled="tooManyOrNotEnoughPlayers"
      class="submit-btn"
    >
      <template v-if="!tooManyOrNotEnoughPlayers"> Save </template>
      <template v-else>
        Need {{ MAX_PLAYERS - draftPlayers.length }} more player{{
          MAX_PLAYERS - draftPlayers.length === 1 ? "" : "s"
        }}
      </template>
    </button>
  </form>
</template>

<style lang="css" scoped>
.field-row {
  display: flex;
  align-items: stretch;
  gap: 8px;
  margin-top: 8px;
}
.field-label {
  margin: 0;
  display: flex;
  align-items: center;
  width: 110px;
  flex: 0 0 110px;
  padding: 0;
  min-height: 36px;
}
.field-control {
  width: 100%;
  max-height: 36px;
}

.squad-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 420px;
  margin: 0 auto;
  padding: 1rem;
}
.squad-section {
  width: 100%;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #000000;
  border-radius: 4px;
}
.list--invalid {
  border: 2px solid red;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: 1px solid #c9c8c8;
}
.player-row:last-child {
  border-bottom: none;
}

.drag-handle {
  color: #7c7c7c;
  font-size: 18px;
  width: 32px;
  flex-shrink: 0;
  text-align: center;
  cursor: grab;
  touch-action: none;
}
.drag-handle:active {
  cursor: grabbing;
}

.number-input {
  width: 44px;
  height: 24px;
  text-align: center;
  font-size: 16px;
}
.player-name {
  flex: 1;
  font-size: 16px;
}

.submit-btn {
  margin-top: 8px;
  padding: 14px;
  font-size: 15px;
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
}
.submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.warn {
  color: red;
}
</style>
