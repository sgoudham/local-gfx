<script setup lang="ts">
import { useOutputSocket } from "~/composables/useOutputSocket";
import type {
  BigMatchScorecardProps,
  MatchScorecardProps,
  PenaltiesScorecardProps,
  SubstitutionProps,
  TeamFormationProps,
} from "~/types";

const { state, publish } = useOutputSocket();

publish(SocketMessage.SessionRegister);

const matchScorecardData = computed<MatchScorecardProps>(() => {
  return {
    name: state.value.graphics.matchScorecard.name,
    visible: state.value.graphics.matchScorecard.visible,
    home: {
      shortName: state.value.home.shortName,
      goals: state.value.home.goals.length,
    },
    away: {
      shortName: state.value.away.shortName,
      goals: state.value.away.goals.length,
    },
    matchTime: state.value.matchTime,
  };
});

const bigMatchScorecardData = computed<BigMatchScorecardProps>(() => {
  return {
    name: state.value.graphics.bigMatchScorecard.name,
    visible: state.value.graphics.bigMatchScorecard.visible,
    home: {
      name: state.value.home.name,
      shortName: state.value.home.shortName,
      goals: state.value.home.goals,
    },
    away: {
      name: state.value.away.name,
      shortName: state.value.away.shortName,
      goals: state.value.away.goals,
    },
    matchTime: state.value.matchTime,
  };
});

const penaltiesScorecardData = computed<PenaltiesScorecardProps>(() => {
  return {
    name: state.value.graphics.penaltiesScorecard.name,
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

const teamFormationData = computed<TeamFormationProps>(() => {
  return {
    name: state.value.graphics.teamFormation.name,
    visible: state.value.graphics.teamFormation.visible,
  };
});

const substitutionData = computed<SubstitutionProps>(() => {
  return state.value.graphics.substitution;
});
</script>

<template>
  <OverlayMatchScorecard v-bind="matchScorecardData" />
  <OverlayBigMatchScorecard v-bind="bigMatchScorecardData" />
  <OverlayPenaltiesScorecard v-bind="penaltiesScorecardData" />
  <OverlayTeamFormation v-bind="teamFormationData" />
  <OverlaySubstitution v-bind="substitutionData" />
</template>

<style scoped></style>
