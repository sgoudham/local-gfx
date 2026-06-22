<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import getMinutes from "~/utils/getMinutes";

const { state, publish } = useOutputSocket();

const listRef = ref<HTMLElement | null>(null);

const scrollToTop = async () => {
  await nextTick();

  if (listRef.value) {
    listRef.value.scrollTop = 0;
  }
};

watch(
  () => state.value.events.length,
  () => {
    scrollToTop();
  }
);
</script>

<template>
  <section class="events-panel">
    <div class="container">
      <p class="events-heading">Match Events</p>
      <ul ref="listRef" class="overlay-list">
        <li v-for="e in [...state.events].reverse()" class="event">
          <div v-if="e.type === 'goalScored'">
            <div :class="['event-header', e.player.location]">
              <div>
                {{ state[e.player.location].shortName }}
              </div>
              <div>
                {{ getMinutes(e.matchTime) }}'
              </div>
            </div>
            ⚽️ GOAL: ({{ e.player.number }})
            {{ e.player.forename }}
            {{ e.player.surname }}
          </div>
          <div v-if="e.type === 'substitution'">
            <div :class="['event-header', e.location]">
              <div>
                {{ state[e.location].shortName }}
              </div>
              <div>
                {{ getMinutes(e.matchTime) }}'
              </div>
            </div>
            🔺🔻 {{ getMinutes(e.matchTime) }}' - Substitution:
          </div>
          <div v-if="e.type === 'substitution'" class="substitution-details">
            <div class="sub-group off-group">
              <p class="group-label">Off</p>

              <div
                v-for="(sub, idx) in e.subs"
                :key="`off-${idx}`"
                class="sub-item"
              >
                <span class="arrow">▼</span>
                <span>
                  ({{ sub[1].number }}) {{ sub[1].forename }} {{ sub[1].surname }}
                </span>
              </div>
            </div>

            <div class="sub-group on-group">
              <p class="group-label">On</p>

              <div
                v-for="(sub, idx) in e.subs"
                :key="`on-${idx}`"
                class="sub-item"
              >
                <span class="arrow">▲</span>
                <span>
                  ({{ sub[0].number }}) {{ sub[0].forename }} {{ sub[0].surname }}
                </span>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style lang="css" scoped>


.events-panel {
  --base-font-size: 20px;

  display: flex;
  justify-content: center;
  font-size: var(--base-font-size);

  font-family: var(--font-display);
}

.container {
  background: #d6cfc7;
  width: 100%;
  max-height: 100dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.events-heading {
  padding: 0.2em;
  font-size: 2em;
  flex: 0 0 auto;
  text-align: center;
}

ul {
  --gap-size: 10vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-size);

  padding: 0;
  margin: 0;
  background: #e4e1db;
  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 1) 5%,
    rgba(0, 0, 0, 1) 85%,
    rgba(0, 0, 0, 0) 100%
  );
}

.overlay-list {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

li {
  padding: 0;
  list-style-type: none;
  flex: 0 0 auto;
}

li:first-child {
  background: #619666;
  color: #ffffff;
  margin-top: calc(var(--gap-size) / 2);
}

li:last-child {
  margin-bottom: var(--gap-size);
}

.event {
  box-sizing: border-box;
  background: #d6cfc7;
  padding: 0.5em 0.5em;
  border-radius: 0.75em;
  text-align: center;
  box-shadow: 2px 2px 9px -5px rgba(0, 0, 0, 0.763);
  width: 90%;
  position: relative;
}

.event:not(:last-child)::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 100%;
  width: 2px;
  height: var(--gap-size);
  background: #71614e;
  transform: translateX(-50%);
}

.substitution-details {
  display: flex;
  flex-direction: column;
  gap: 0.75em;
  margin-top: 0.5em;
  font-size: 0.9em;
}

.sub-group {
  display: flex;
  flex-direction: column;
  gap: 0.35em;
  padding: 0.4em;
  border-radius: 0.5em;
  background: rgba(52, 52, 52, 0.251);
}

.group-label {
  font-weight: 600;
  opacity: 0.8;
  margin: 0 0 0.25em 0;
  text-align: left;
}

.sub-item {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.off-group .arrow {
  color: #d82222;
  font-weight: bold;
}

.on-group .arrow {
  color: #42de42;
  font-weight: bold;
}

.event-header {
  position: relative;
  padding: 0.1em 0.4em;
  margin-bottom: 0.4em;
  border-radius: 0.3em;
  font-family: var(--font-subheading);
  font-weight: bold;
  font-size: 1.2em;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.763);
  display: flex;
  justify-content: space-between;
}

.home {
  background: var(--home-colour-1);
  color: var(--home-colour-2)
}

.away {
  background: var(--away-colour-1);
  color: var(--away-colour-2)
}

</style>
