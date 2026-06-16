<script setup lang="ts">
import type { EditTeamDialogProps } from "~/types";

const props = defineProps<EditTeamDialogProps>();

const emit = defineEmits<{
  save: [players: Player[], substitutes: Player[], manager: string];
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);

const draftPlayers = ref<Player[]>([]);
const draftSubs = ref<Player[]>([]);
const draftManager = ref<string>("");

type DragList = "players" | "subs";
const dragSource = ref<{ list: DragList; index: number } | null>(null);

function open() {
  draftPlayers.value = props.players.map((p) => ({ ...p }));
  draftSubs.value = props.substitutes.map((p) => ({ ...p }));
  draftManager.value = `${props.manager}`;
  dialogRef.value?.showModal();
}

function close() {
  dialogRef.value?.close();
}

function save() {
  emit("save", draftPlayers.value, draftSubs.value, draftManager.value);
  close();
}

function onDragStart(list: DragList, index: number) {
  dragSource.value = { list, index };
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
      <h4>Manager</h4>
      <input type="text" v-model="draftManager" />

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
            class="cursor-move"
            draggable="true"
            @dragstart="onDragStart('players', index)"
            @dragover.prevent
            @drop.prevent="onDrop('players', index)"
            @dragend="onDragEnd"
          >
            <td>
              <button
                type="button"
                class="drag-handle"
                aria-label="Drag player"
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
            draggable="true"
            @dragstart="onDragStart('subs', index)"
            @dragover.prevent
            @drop.prevent="onDrop('subs', index)"
            @dragend="onDragEnd"
          >
            <td>
              <button
                type="button"
                class="drag-handle"
                aria-label="Drag substitute"
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
</style>
