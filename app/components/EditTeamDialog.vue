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

function open() {
  draftPlayers.value = props.players.map((p) => ({ ...p }));
  draftSubs.value = props.substitutes.map((p) => ({ ...p }));
  draftManager.value = `${props.manager}`;
  dialogRef.value?.showModal();
}

function close() {
  dialogRef.value?.close();
}

function addSub() {
  draftSubs.value.push({
    id: crypto.randomUUID(),
    forename: "",
    surname: "",
    number: 0,
    location: props.location,
  });
}

function removeSub(index: number) {
  draftSubs.value.splice(index, 1);
}

function save() {
  emit("save", draftPlayers.value, draftSubs.value, draftManager.value);
  close();
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
            <th>#</th>
            <th>Forename</th>
            <th>Surname</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in draftPlayers" :key="player.id">
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
            <th>#</th>
            <th>Forename</th>
            <th>Surname</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sub, i) in draftSubs" :key="sub.id">
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
            <td>
              <button type="button" @click="removeSub(i)">Remove</button>
            </td>
          </tr>
        </tbody>
      </table>
      <button type="button" @click="addSub">+ Add Sub</button>

      <div style="margin-top: 12px; display: flex; gap: 8px">
        <button type="submit">Save</button>
        <button type="button" @click="close">Cancel</button>
      </div>
    </form>
  </dialog>
</template>
