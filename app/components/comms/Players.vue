<script setup lang="ts">
import type { SocialMediaPlayersProps } from "~/types";

const props = defineProps<SocialMediaPlayersProps>();

const visiblePlayers = computed(() =>
  props.players.filter(
    (player) => player.forename.trim() !== "" || player.surname.trim() !== "",
  ),
);

const visibleSubstitutes = computed(() =>
  props.substitutes.filter(
    (player) => player.forename.trim() !== "" || player.surname.trim() !== "",
  ),
);

const captainId = computed(() => props.captain.id);
</script>

<template>
  <section class="container" :data-location="props.location">
    <div class="social-media-players">
      <div class="team-info">
        <h1>{{ props.name }}</h1>
        <h3>Manager: {{ props.manager }}</h3>
        <div class="squad-info">
          <h2>On-field Players</h2>
          <ul>
            <li v-for="player in visiblePlayers" :key="player.id">
              {{ player.number }}. {{ player.forename }} {{ player.surname }}
              {{ player.id === captainId ? "(C)" : "" }} {{ formatCards(player.cards) }}
            </li>
          </ul>
          <h2>Substitutes</h2>
          <ul class="substitutes">
            <li
              class="substitute"
              v-for="player in visibleSubstitutes"
              :key="player.id"
            >
              {{ player.number }}. {{ player.forename }} {{ player.surname }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="css" scoped>
.container[data-location="home"] {
  --primary-colour: var(--home-colour-1);
  --secondary-colour: var(--home-colour-2);
  --gradient-direction: 90deg;
}

.container[data-location="away"] {
  --primary-colour: var(--away-colour-1);
  --secondary-colour: var(--away-colour-2);
  --gradient-direction: 270deg;
}

.container {
  background: #00000000;
  overflow: hidden;

  --base-font-size: 18px;
}

.social-media-players {
  font-family: var(--font-display);
  font-size: var(--base-font-size);
  color: var(--text-color);
  padding: 1em;
  background: var(--primary-colour);
  color: var(--secondary-colour);
  position: relative;
  overflow: hidden;
  height: 100%;
}

.social-media-players::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(
    var(--gradient-direction),
    rgb(0, 0, 0),
    rgba(0, 0, 0, 0) 75%
  );
  mix-blend-mode: overlay;
}

h3 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

</style>
