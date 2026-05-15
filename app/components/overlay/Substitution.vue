<script setup lang="ts">
import gsap from "gsap";
import type { SubstitutionProps } from "~/types";

const props = defineProps<SubstitutionProps>();

const overlay = useTemplateRef("overlay");
const rendered = ref(false);

const getImageUrl = (path: string) => {
  return new URL(`../../assets/${path}`, import.meta.url).href;
};

async function show() {
  rendered.value = true;
  nextTick(() => {
    if (overlay.value) {
      gsap.fromTo(
        overlay.value,
        { opacity: 0, y: -10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
      );
    }
  });
}

async function hide() {
  return new Promise<void>((resolve) => {
    nextTick(() => {
      if (!overlay.value) {
        rendered.value = false;
        resolve();
        return;
      }

      gsap.fromTo(
        overlay.value,
        { opacity: 1, y: 0 },
        {
          opacity: 0,
          y: -10,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            rendered.value = false;
            resolve();
          },
        },
      );
    });
  });
}

watch(
  () => props.visible,
  async (visible) => {
    if (visible) {
      await show();
    } else {
      await hide();
    }
  },
  { immediate: true },
);
</script>

<!-- TODO: Support different ribbon colours for AC Malones -->

<template>
  <section class="overlay" ref="overlay" v-if="rendered">
    <div class="broadcast">
      <div class="ribbon-box">
        <div class="ribbon"></div>
        <div class="ribbon"></div>
      </div>

      <div class="scorecard">
        <div class="substitute-boxes">
          <div
            v-for="player in props.playersOut"
            :key="`out-${player.number}-${player.forename}-${player.surname}`"
            class="panel player-off"
          >
            <div class="player-off-background"></div>
            <span class="sub-name"
              >{{ player.number }}. {{ player.forename }}
              {{ player.surname }}</span
            >
            <div class="sub-arrow-row">
              <div class="sub-arrow player-off-arrow">▼</div>
            </div>
          </div>
          <div
            v-for="player in props.subsIn"
            :key="`in-${player.number}-${player.forename}-${player.surname}`"
            class="panel player-on"
          >
            <div class="player-on-background"></div>
            <span class="sub-name"
              >{{ player.number }}. {{ player.forename }}
              {{ player.surname }}</span
            >
            <div class="sub-arrow-row">
              <div class="sub-arrow player-on-arrow">▲</div>
            </div>
          </div>
        </div>
      </div>

      <div class="team-badge">
        <img :src="getImageUrl(badgeSrc)" alt="Team Badge" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.overlay {
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  font-family: var(--font-display);
  color: var(--text-color);
  overflow: visible;
  position: absolute;
  bottom: 0px;
}

.overlay,
.overlay::before,
.overlay::after {
  box-sizing: border-box;
  margin: 0;
  padding: 25px;
}

/* ── Outer wrapper ── */
.broadcast {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 15px;
  transform-origin: bottom left;
  transform: translateX(20px) scale(1.7);
  position: relative;
  overflow: visible;
  padding-inline: 40px;
}

/* ── Ribbon box (decorative skewed stripes behind everything) ── */
.ribbon-box {
  position: absolute;
  left: -10px;
  right: 0px;
  bottom: 0; /* ← anchor to bottom */
  transform: skewX(30deg);
  transform-origin: center;
  overflow: visible;
  height: 90px;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10%;
}

.ribbon {
  background: var(--ribbon-colour);
  width: 95%;
  height: 30%;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
}

/* ── Main scorecard panel ── */
.scorecard {
  display: flex;
  align-items: stretch;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
  position: relative;
  z-index: 1;
}

/* ── Shared panel base ── */
.panel {
  background: #ecdfc5;
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
  gap: 10px;
}

.panel:not(:last-child) {
  border-bottom: 1px solid var(--home-colour-1);
}

.substitute-boxes {
  display: flex;
  flex-direction: column;
}

/* ── Player on panel ── */
.player-on {
  position: relative;
  color: var(--home-colour-1);
}

.player-on-background {
  position: absolute;
  inset: 0;
  background: var(--home-colour-2);
  z-index: 0;
}

.player-on::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0) 55%, rgb(0, 0, 0));
  mix-blend-mode: soft-light;
}

/* ── Player off panel ── */
.player-off {
  position: relative;
  color: var(--home-colour-2);
}

.player-off-background {
  position: absolute;
  inset: 0;
  background: var(--home-colour-1);
  z-index: 0;
}

.player-off::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0) 55%, rgb(0, 0, 0));
  mix-blend-mode: soft-light;
}

/* Ensure content sits above the absolute background divs */
.player-off > :not(.player-off-background),
.team-away > :not(.team-away-background) {
  position: relative;
  z-index: 2;
}

.player-on > :not(.player-on-background) {
  position: relative;
  z-index: 2;
}

.player-off .sub-name,
.player-on .sub-name {
  font-size: 36px;
  padding: 0 12px;
}

.sub-name {
  margin-right: 30px;
}

.sub-arrow-row {
  margin-left: auto;
  padding-right: 12px;
}

.sub-arrow {
  font-size: 36px;
}

.player-off-arrow {
  color: #d82222;
}

.player-on-arrow {
  color: #2a7d2a;
}

.team-badge {
  height: 100px;
  z-index: 10;
}

.team-badge img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
