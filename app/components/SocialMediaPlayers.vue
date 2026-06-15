<script setup lang="ts">
import type { SocialMediaPlayersProps } from "~/types";

const props = defineProps<SocialMediaPlayersProps>();
</script>

<template>
  <h1>{{ props.name }}</h1>
  <h2>Starting 11</h2>
  <ul>
    <li v-for="player in props.players">
      {{ player.number }}' {{ player.forename }} {{ player.surname }}
    </li>
  </ul>
</template>

<style lang="css" scoped></style>
