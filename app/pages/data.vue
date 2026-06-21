<script setup lang="ts">
import { TeamLocation } from "#imports";
import EditTeamForm from "~/components/EditTeamForm.vue";
import type { EditTeamFormProps } from "~/types";
import type { TeamLocation as TLocation } from "~~/shared/types/data";

const { state, publish } = useControlSocket();
publish(SocketMessage.SessionRegister);

const activeTeam = ref<TLocation>(TeamLocation.Home);

const data = computed<EditTeamFormProps>(() => {
  return {
    location: activeTeam.value,
    players: state.value[activeTeam.value].players,
    substitutes: state.value[activeTeam.value].substitutes,
    manager: state.value[activeTeam.value].manager,
    captain: state.value[activeTeam.value].captain,
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
      location: activeTeam.value,
      players: updatedPlayers,
      substitutes: updatedSubs,
      manager: updatedManager,
      captain: updatedCaptain,
    },
  });
}
</script>

<template>
  <main>
    <EditTeamForm v-bind="data" @save="onTeamSave" />
  </main>

  <nav class="tabs" :data-location="activeTeam">
    <button
      type="button"
      :class="{ 'tab--active': activeTeam === TeamLocation.Home }"
      @click="activeTeam = TeamLocation.Home"
    >
      {{ state.home.name }}
    </button>
    <button
      type="button"
      :class="{ 'tab--active': activeTeam === TeamLocation.Away }"
      @click="activeTeam = TeamLocation.Away"
    >
      {{ state.away.name }}
    </button>
  </nav>
</template>

<style lang="css" scoped>
main {
  margin-bottom: 68px;
}

.tabs[data-location="home"] {
  --primary-colour: var(--home-colour-1);
  --secondary-colour: var(--home-colour-2);
}
.tabs[data-location="away"] {
  --primary-colour: var(--away-colour-1);
  --secondary-colour: var(--away-colour-2);
}
.tabs {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  flex-direction: row;
  border-top: 1px solid #ddd;
  background: #fff;
}

.tabs button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  gap: 6px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.tabs button.tab--active {
  color: #111;
  font-weight: 600;
  font-size: large;
  border-top: 4px solid var(--secondary-colour);
  background: var(--primary-colour);
}
</style>
