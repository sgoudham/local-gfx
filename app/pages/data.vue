<script setup lang="ts">
import EditTeamForm from "~/components/EditTeamForm.vue";
import type { EditTeamFormProps } from "~/types";

const { state, publish } = useControlSocket();
publish(SocketMessage.SessionRegister);

// Hardcode home for now, need to implement tab switching to do both teams.
const editTeamFormData = computed<EditTeamFormProps>(() => {
  return {
    location: state.value.home.location,
    players: state.value.home.players,
    substitutes: state.value.home.substitutes,
    manager: state.value.home.manager,
    captain: state.value.home.captain,
  };
});

function onTeamSave(
  updatedPlayers: Player[],
  updatedSubs: Player[],
  updatedManager: string,
  updatedCaptain: Player,
) {
  publish(SocketMessage.TeamInfoUpdate, {
    data: {
      location: editTeamFormData.value.location,
      players: updatedPlayers,
      substitutes: updatedSubs,
      manager: updatedManager,
      captain: updatedCaptain,
    },
  });
}
</script>

<template>
  <EditTeamForm v-bind="editTeamFormData" @save="onTeamSave" />
</template>

<style lang="css" scoped></style>
