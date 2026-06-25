<script setup lang="ts">
import type {
  BigMatchScorecardProps,
  MatchScorecardProps,
  PenaltiesScorecardProps,
  StartingSoonProps,
  SubstitutionProps,
  TeamFormationProps,
  HydrationBreakProps,
  DonationUpdateProps,
} from "~/types";

useSocket(Mode.Output);
useSocket(Mode.Donations);
const { state } = useClientState();

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
      squad: new Map(
        [...state.value.home.players, ...state.value.home.substitutes].map(
          (player) => [player.id, player],
        ),
      ),
      goals: state.value.home.goals,
    },
    away: {
      name: state.value.away.name,
      shortName: state.value.away.shortName,
      squad: new Map(
        [...state.value.away.players, ...state.value.away.substitutes].map(
          (player) => [player.id, player],
        ),
      ),
      goals: state.value.away.goals,
    },
    matchTime: state.value.matchTime,
  };
});

const startingSoonData = computed<StartingSoonProps>(() => {
  return {
    name: state.value.graphics.startingSoon.name,
    visible: state.value.graphics.startingSoon.visible,
    kickoffTime: state.value.graphics.startingSoon.kickoffTime,
  };
});

const penaltiesScorecardData = computed<PenaltiesScorecardProps>(() => {
  return {
    name: state.value.graphics.penaltiesScorecard.name,
    visible: state.value.graphics.penaltiesScorecard.visible,
    home: {
      location: state.value.home.location,
      shortName: state.value.home.shortName,
      penalties: state.value.home.penalties,
    },
    away: {
      location: state.value.away.location,
      shortName: state.value.away.shortName,
      penalties: state.value.away.penalties,
    },
  };
});

const teamFormationData = computed<TeamFormationProps>(() => {
  const location = state.value.graphics.teamFormation.location;
  return {
    name: state.value.graphics.teamFormation.name,
    visible: state.value.graphics.teamFormation.visible,
    team: {
      location,
      name: state.value[location].name,
      shortName: state.value[location].shortName,
      manager: state.value[location].manager,
      activeFormation: state.value[location].activeFormation,
      players: state.value[location].players,
      substitutes: state.value[location].substitutes,
      captain: state.value[location].captain,
    },
  };
});

const substitutionData = computed<SubstitutionProps>(() => {
  return state.value.graphics.substitution;
});

const hydrationBreakData = computed<HydrationBreakProps>(() => {
  return {
    name: state.value.graphics.hydrationBreak.name,
    visible: state.value.graphics.hydrationBreak.visible,
  };
});

const donationUpdateData = computed<DonationUpdateProps>(() => {
  return {
    name: state.value.graphics.donationUpdate.name,
    visible: state.value.graphics.donationUpdate.visible,
  }
});
</script>

<template>
  <OverlayMatchScorecard v-bind="matchScorecardData" />
  <OverlayBigMatchScorecard v-bind="bigMatchScorecardData" />
  <OverlayPenaltiesScorecard v-bind="penaltiesScorecardData" />
  <OverlayTeamFormation v-bind="teamFormationData" />
  <OverlaySubstitution v-bind="substitutionData" />
  <OverlayHydrationBreak v-bind="hydrationBreakData" />
  <OverlayDonationUpdate v-bind="donationUpdateData" />
  <OverlayStartingSoon v-bind="startingSoonData" />
</template>

<style scoped></style>
