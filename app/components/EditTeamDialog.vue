<script setup lang="ts">
import type { EditTeamDialogProps } from "~/types";

const props = defineProps<EditTeamDialogProps>();

const emit = defineEmits<{
  save: [
    players: Player[],
    substitutes: Player[],
    manager: string,
    captain: Player,
  ];
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);

const draftPlayers = ref<Player[]>([]);
const draftSubs = ref<Player[]>([]);
const draftManager = ref<string>("");
const draftCaptain = ref<Player>(props.captain);

type DragList = "players" | "subs";
const dragSource = ref<{ list: DragList; index: number } | null>(null);

function open() {
  draftPlayers.value = props.players.map((p) => ({ ...p }));
  draftSubs.value = props.substitutes.map((p) => ({ ...p }));
  draftManager.value = `${props.manager}`;
  draftCaptain.value = draftPlayers.value.find(
    (player) => player.id === props.captain.id,
  )!;
  dialogRef.value?.showModal();
}

function close() {
  dialogRef.value?.close();
}

function save() {
  emit(
    "save",
    draftPlayers.value,
    draftSubs.value,
    draftManager.value,
    draftCaptain.value,
  );
  close();
}

function onDragStart(event: DragEvent, list: DragList, index: number) {
  dragSource.value = { list, index };
  const row = (event.currentTarget as HTMLElement).closest("tr");
  if (row) event.dataTransfer?.setDragImage(row, 0, 0);
}

function onDrop(targetList: DragList, targetIndex: number) {
  if (!dragSource.value) return;

  const { list: sourceList, index: sourceIndex } = dragSource.value;
  dragSource.value = null;

  if (sourceList === targetList && sourceIndex === targetIndex) return;

  const sourceArr = sourceList === "players" ? draftPlayers : draftSubs;
  const targetArr = targetList === "players" ? draftPlayers : draftSubs;

  if (sourceList === targetList) {
    // re-ordering same list
    const [item] = sourceArr.value.splice(sourceIndex, 1);
    if (item) sourceArr.value.splice(targetIndex, 0, item);
  } else {
    // swapping players and subs
    const sourceItem = sourceArr.value[sourceIndex];
    const targetItem = targetArr.value[targetIndex];
    if (sourceItem && targetItem) {
      targetItem.x = sourceItem.x;
      targetItem.y = sourceItem.y;
      sourceArr.value.splice(sourceIndex, 1, targetItem);
      targetArr.value.splice(targetIndex, 1, sourceItem);
    }
  }
}

function onDragEnd() {
  dragSource.value = null;
}

defineExpose({ open });
</script>

<template>
  <Button class="action" @click="open">📝</Button>

  <dialog ref="dialogRef">
    <form method="dialog" @submit.prevent="save">
      <div class="field-row">
        <h4 class="field-label">Manager:</h4>
        <input type="text" v-model="draftManager" class="field-control" />
      </div>

      <div class="field-row">
        <h4 class="field-label">Captain:</h4>
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

      <h4>Players</h4>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>#</th>
            <th>Forename</th>
            <th>Surname</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(player, index) in draftPlayers"
            :key="player.id"
            @dragover.prevent
            @drop.prevent="onDrop('players', index)"
            @dragend="onDragEnd"
          >
            <td>
              <button
                type="button"
                aria-label="Drag player"
                class="cursor-move drag-handle"
                draggable="true"
                @dragstart="onDragStart($event, 'players', index)"
              >
                ::
              </button>
            </td>
            <td>
              <input
                type="number"
                min="1"
                v-model.number="player.number"
                style="width: 50px"
              />
            </td>
            <td>
              <input type="text" v-model="player.forename" />
            </td>
            <td>
              <input type="text" v-model="player.surname" />
            </td>
          </tr>
        </tbody>
      </table>

      <h4>Substitutes</h4>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>#</th>
            <th>Forename</th>
            <th>Surname</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(sub, index) in draftSubs"
            :key="sub.id"
            class="cursor-move"
            @dragover.prevent
            @drop.prevent="onDrop('subs', index)"
            @dragend="onDragEnd"
          >
            <td>
              <button
                type="button"
                class="drag-handle"
                aria-label="Drag substitute"
                draggable="true"
                @dragstart="onDragStart($event, 'subs', index)"
              >
                ::
              </button>
            </td>
            <td>
              <input
                type="number"
                min="1"
                v-model.number="sub.number"
                style="width: 50px"
              />
            </td>
            <td>
              <input type="text" v-model="sub.forename" />
            </td>
            <td>
              <input type="text" v-model="sub.surname" />
            </td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 12px; display: flex; gap: 8px">
        <button type="submit">Save</button>
        <button type="button" @click="close">Cancel</button>
      </div>
    </form>
  </dialog>
</template>

<style scoped>
.drag-handle {
  border: 0;
  background: transparent;
  cursor: grab;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 0 6px 0 0;
}

.field-row {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.field-row + .field-row {
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
</style>
