<script setup lang="ts">
import { useOutputSocket } from "~/composables/useOutputSocket";
import type {
  MatchScorecardProps,
  PenaltiesScorecardProps,
  TeamFormationProps,
} from "~/types";

const { state } = useOutputSocket();

const matchScorecardData = computed<MatchScorecardProps | null>(() => {
  if (!state.value) {
    return null;
  }
  return {
    visible: state.value.graphics.matchScorecard.visible,
    home: {
      shortName: state.value.home.shortName,
      goals: state.value.home.goals.length,
    },
    away: {
      shortName: state.value.away.shortName,
      goals: state.value.away.goals.length,
    },
    matchTime: state.value.matchTime.formatted,
  };
});

const penaltiesScorecardData = computed<PenaltiesScorecardProps | null>(() => {
  if (!state.value) {
    return null;
  }
  return {
    visible: state.value.graphics.penaltiesScorecard.visible,
    home: {
      id: state.value.home.id,
      shortName: state.value.home.shortName,
      penalties: state.value.home.penalties,
    },
    away: {
      id: state.value.away.id,
      shortName: state.value.away.shortName,
      penalties: state.value.away.penalties,
    },
  };
});

const teamFormationData = computed<TeamFormationProps | null>(() => {
  if (!state.value) {
    return null;
  }
  return {
    visible: state.value.graphics.teamFormation.visible,
  };
});
</script>

<template>
  <OverlayMatchScorecard
    v-if="matchScorecardData"
    v-bind="matchScorecardData"
  />
  <OverlayPenaltiesScorecard
    v-if="penaltiesScorecardData"
    v-bind="penaltiesScorecardData"
  />
  <OverlayTeamFormation v-if="teamFormationData" v-bind="teamFormationData" />
</template>

<style scoped></style>
