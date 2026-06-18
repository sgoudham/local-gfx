<script setup lang="ts">
import type { SocialMediaPlayersProps } from "~/types";

const props = defineProps<SocialMediaPlayersProps>();
const imageUrl = computed(() =>
  props.location === "home" ? "/homeBadge.png" : "/awayBadge.png",
);
const imageUrlPlayer = computed(() =>
  props.location === "home" ? "/callum.png" : "/eoghan.png",
);

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

const captainId = computed(() => props.captain?.id);
</script>

<template>
  <section class="container"
    :data-location="props.location">
      <div class="social-media-players">
        <div class="team-info">
        <h1>{{ props.name }}</h1>
        <div class="squad-info">
          <h2>Starting XI</h2>
          <ul>
            <li v-for="player in visiblePlayers" :key="player.id">
              {{ player.number }}. {{ player.forename }} {{ player.surname }} {{ player.id === captainId ? '(C)' : '' }}
            </li>
          </ul>
          <h2>Substitutes</h2>
          <ul class="substitutes">
            <li class="substitute" v-for="player in visibleSubstitutes" :key="player.id">
              {{ player.number }}. {{ player.forename }} {{ player.surname }} {{ player.id === captainId ? '(C)' : '' }}
            </li>
          </ul>
        </div>
        <div class="decor">
          <div class="player-img">
            <img :src="imageUrlPlayer" alt="Player">
          </div>
          <div class="team-badge">
            <img :src="imageUrl" alt="Team Badge" />
          </div>
        </div>
        <div class="league-badge">
          <img src="/26LogoOutlinesTransparent.png" alt="League Badge">
        </div>
        <div class="bottom-flair">
          <div class="flair-line"></div>
          <div class="flair-glow"></div>
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
}

.social-media-players {
  font-family: var(--font-display);
  font-size: 10px;
  color: var(--text-color);
  padding: 1em;
  background: var(--primary-colour);
  color: var(--secondary-colour);
  position: relative;
  overflow: hidden;
}

.social-media-players::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(var(--gradient-direction), rgb(0, 0, 0), rgba(0, 0, 0, 0) 75%);
  mix-blend-mode: overlay;
}

.squad-info {
  max-width: 50%;
  z-index: 1;
  position: relative;
}

h1 {
  font-weight: normal;
  font-size: 3em;
  text-transform: uppercase;
  margin: 0;
}

h2 {
  font-weight: normal;
  font-style: italic;
  margin-bottom: auto;
}

li {
  margin-left: 0.3em;
  font-weight: normal;
  font-style: italic;
  font-size: 1.3em;
}

ul {
  list-style: none;
  padding: 0;
}

.substitutes {
  display: flex;
  flex-wrap: wrap;
  text-align-last: justify;
  column-gap: 1em;
  font-size: 0.9em;
}

.substitute {
  opacity: 0.8;
}

.decor {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.player-img {
  position: absolute;
  bottom: 0;
  right: 0;
  height: 90%;
  z-index: 3;
}

.player-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(5px 5px 10px #3a3a3aa3);
}

.team-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  height: 80%;
  z-index: 0;
  overflow: hidden;
  mix-blend-mode: screen;
  opacity: 50%;
}

.team-badge img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: translate(50px, 50px);
}

.league-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  height: 12%;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
}

.league-badge img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: relative;
  z-index: 2;
  filter: brightness(0) ;
}

</style>
