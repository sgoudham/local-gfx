<script setup lang="ts">
import { useControlSocket } from "~/composables/useControlSocket";

const { publish } = useControlSocket();

const startMatchTimer = () => publish(Overlays.MatchScorecardTimerStart);
const stopMatchTimer = () => publish(Overlays.MatchScorecardTimerStop);
const resetMatchTimer = () => publish(Overlays.MatchScorecardTimerReset);
const animateScorecard = () => publish(Overlays.MatchScorecardShow);
const destoryScorecard = () => publish(Overlays.MatchScorecardHide);
</script>

<template>
  <button @click="startMatchTimer">Start Match Timer</button>
  <button @click="stopMatchTimer">Stop</button>
  <button @click="resetMatchTimer">Reset</button>
  <br />
  <button @click="animateScorecard">Animate Match Scorecard</button>
  <button @click="destoryScorecard">Destroy Match Scorecard</button>
  <WindowFrame title="LIVE" src="/output" />
</template>
