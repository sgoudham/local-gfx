<script setup lang="ts">
import gsap from "gsap";
import type { BigMatchScorecardProps } from "~/types";
import getMinutes from "~/utils/getMinutes";

const props = defineProps<BigMatchScorecardProps>();

const overlay = useTemplateRef("overlay");
const homeScorersRef = useTemplateRef<HTMLElement>("homeScorersRef");
const awayScorersRef = useTemplateRef<HTMLElement>("awayScorersRef");
const rendered = ref(false);

const AUTO_SCROLL_PX_PER_SEC = 15;
const HOLD_AT_TOP_SEC = 1.2;
const HOLD_AT_BOTTOM_SEC = 1.5;
const RESET_FADE_SEC = 0.4;
const autoScrollTweens: gsap.core.Timeline[] = [];

function startAutoScrollFor(trackEl: HTMLElement | null) {
  if (!trackEl) return;

  gsap.set(trackEl, { y: 0, opacity: 1 });

  const viewportEl = trackEl.parentElement;
  if (!viewportEl) return;

  const contentHeight = trackEl.scrollHeight;
  const maxOffset = contentHeight - viewportEl.clientHeight;
  if (maxOffset <= 0) return;

  const timeline = gsap.timeline({ repeat: -1 });
  timeline.to({}, { duration: HOLD_AT_TOP_SEC });
  timeline.to(trackEl, {
    y: -maxOffset,
    duration: maxOffset / AUTO_SCROLL_PX_PER_SEC,
    ease: "none",
  });
  timeline.to({}, { duration: HOLD_AT_BOTTOM_SEC });
  timeline.to(trackEl, {
    opacity: 0,
    duration: RESET_FADE_SEC,
    ease: "power1.in",
  });
  timeline.set(trackEl, { y: 0 });
  timeline.to(trackEl, {
    opacity: 1,
    duration: RESET_FADE_SEC,
    ease: "power1.out",
  });

  autoScrollTweens.push(timeline);
}

function startAutoScroll() {
  stopAutoScroll();
  startAutoScrollFor(homeScorersRef.value);
  startAutoScrollFor(awayScorersRef.value);
}

function stopAutoScroll() {
  for (const tween of autoScrollTweens) {
    tween.kill();
  }
  autoScrollTweens.length = 0;
}

function dedupeGoals(goals: TeamState["goals"], squad: Map<string, Player>) {
  const groupedGoals = new Map<
    string,
    { player: Player; minuteLabels: string[] }
  >();

  for (const goal of goals) {
    const minuteLabel = `'${getMinutes(goal.matchTime)}`;
    const key = goal.player.id;
    const groupedGoal = groupedGoals.get(key);

    if (groupedGoal) {
      groupedGoal.minuteLabels.push(minuteLabel);
    } else {
      groupedGoals.set(key, {
        player: squad.get(key) ?? goal.player,
        minuteLabels: [minuteLabel],
      });
    }
  }

  return Array.from(groupedGoals.values());
}

function goalsSignature(goals: TeamState["goals"]) {
  return goals
    .map((goal) => `${goal.player.id}-${goal.matchTime.formatted}`)
    .join("|");
}

// FIXME: Instead of combining players and substitutes on the client side, there
// should be a lookup object containing all the players and substitutes already
const goals = computed(() => ({
  home: dedupeGoals(props.home.goals, props.home.squad),
  away: dedupeGoals(props.away.goals, props.away.squad),
  signature: `${goalsSignature(props.home.goals)}::${goalsSignature(props.away.goals)}`,
}));

async function show() {
  rendered.value = true;
  nextTick(() => {
    startAutoScroll();
    if (!overlay.value) return;
    gsap.fromTo(
      overlay.value,
      { opacity: 0, y: -10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: "power2.out",
      },
    );
  });
}

async function hide() {
  stopAutoScroll();

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
          duration: 0.75,
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

watch(
  () => goals.value.signature,
  () => {
    if (!props.visible || !rendered.value) return;
    nextTick(() => {
      startAutoScroll();
    });
  },
  { immediate: false },
);

onMounted(() => {
  if (!props.visible) return;
  nextTick(() => {
    startAutoScroll();
  });
});

onUnmounted(() => {
  stopAutoScroll();
});
</script>

<template>
  <section class="overlay" ref="overlay" v-if="rendered">
    <div class="broadcast-large">
      <div class="ribbon-box">
        <div class="ribbon"></div>
        <div class="ribbon"></div>
      </div>

      <div class="scorecard-large">
        <div class="panel large-panel team-home">
          <div class="team-home-background background-large"></div>
          <span class="team-abbr-large">{{ home.shortName }}</span>

          <div class="team-details-row home-details">
            <div class="scorers">
              <div class="scorers-track" ref="homeScorersRef">
                <div
                  v-for="goal in goals.home"
                  :key="`home-${goal.player.id}`"
                  class="scorer"
                >
                  {{ goal.player.number }}: {{ goal.player.forename }}
                  {{ goal.player.surname }}
                  ({{ goal.minuteLabels.join(", ") }})
                </div>
              </div>
            </div>
            <div class="team-name team-name-home">{{ home.name }}</div>
          </div>

          <div class="score-row">
            <div class="score-large home-score-large">
              {{ home.goals.length }}
            </div>
          </div>
        </div>

        <div class="league-badge-large">
          <img src="/jmBall.png" alt="League Badge" />
        </div>

        <div class="panel large-panel team-away">
          <div class="team-away-background background-large"></div>

          <div class="score-row">
            <div class="score-large away-score-large">
              {{ away.goals.length }}
            </div>
          </div>

          <div class="team-details-row away-details">
            <div class="scorers">
              <div class="scorers-track" ref="awayScorersRef">
                <div
                  v-for="goal in goals.away"
                  :key="`away-${goal.player.id}`"
                  class="scorer"
                >
                  {{ goal.player.number }}: {{ goal.player.forename }}
                  {{ goal.player.surname }} ({{ goal.minuteLabels.join(", ") }})
                </div>
              </div>
            </div>
            <div class="team-name team-name-away">{{ away.name }}</div>
          </div>

          <span class="team-abbr-large">{{ away.shortName }}</span>
        </div>
      </div>

      <div class="timer-box-large">
        <span class="timer-text-large timer">{{ matchTime.formatted }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.overlay {
  --large-scoreboard-x-padding: 20px;
  position: fixed;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  font-family: var(--font-display);
  color: var(--text-color);
  padding: 16px 16px 60px;
  overflow: hidden;
  pointer-events: none;
}

.broadcast-large {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  position: relative;
  margin: 0;
  width: max-content;
  overflow: visible;
  padding-inline: 60px;
  z-index: 5;
  transform-origin: bottom center;
  transform: scale(0.8);
}

.ribbon-box {
  position: absolute;
  left: 5px;
  right: 5px;
  transform: skewX(-30deg);
  transform-origin: center;
  overflow: visible;
  height: 100%;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10%;
}

.ribbon {
  background: var(--ribbon-colour);
  width: 100%;
  height: 30%;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
}

.scorecard-large {
  display: flex;
  align-items: stretch;
  height: 160px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.758);
  position: relative;
  z-index: 1;
  padding: 0 var(--large-scoreboard-x-padding);
}

.panel {
  background: #ecdfc5;
  position: relative;
  display: flex;
  overflow: hidden;
  gap: 10px;
}

.large-panel {
  width: 55vw;
  overflow: visible;
  align-items: flex-end;
  padding-bottom: 2px;
}

.team-home {
  position: relative;
  color: var(--home-colour-2);
}

.team-home-background {
  position: absolute;
  inset: 0;
  background: var(--home-colour-1);
  z-index: 0;
}

.background-large {
  margin: 0 calc(var(--large-scoreboard-x-padding) * -1);
}

.team-home::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0) 55%, rgb(0, 0, 0));
  mix-blend-mode: soft-light;
}

.team-away {
  position: relative;
  justify-content: flex-end;
  color: var(--away-colour-2);
}

.team-away-background {
  position: absolute;
  inset: 0;
  background: var(--away-colour-1);
  z-index: 0;
}

.team-away::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(90deg, rgb(0, 0, 0), rgba(0, 0, 0, 0) 55%);
  mix-blend-mode: overlay;
}

.team-home > :not(.team-home-background),
.team-away > :not(.team-away-background) {
  position: relative;
  z-index: 2;
}

.team-home > .score-row,
.team-away > .score-row {
  z-index: 9;
}

.team-home > .team-details-row,
.team-away > .team-details-row {
  z-index: 1;
}

.team-abbr-large {
  line-height: 1;
  letter-spacing: -0.01em;
  z-index: 1;
  font-family: var(--font-secondary);
  font-size: 170px;
}

.team-details-row {
  align-content: end;
  width: 45%;
}

.home-details {
  justify-content: flex-start;
  text-align: left;
}

.away-details {
  justify-content: flex-end;
  text-align: right;
}

.team-name {
  font-size: 50px;
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;
  margin-top: -13px;
}

.team-name-home {
  mask-image: linear-gradient(to right, rgba(0, 0, 0, 1) 90%, rgba(0, 0, 0, 0));
}

.team-name-away {
  mask-image: linear-gradient(to left, rgba(0, 0, 0, 1) 90%, rgba(0, 0, 0, 0));
  direction: rtl;
}

.scorers {
  font-size: 28px;
  font-style: italic;
  width: 100%;
  max-height: 87px;
  overflow: hidden;
  text-overflow: clip;
  align-content: flex-end;
  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 1) 15%,
    rgba(0, 0, 0, 1) 85%,
    rgba(0, 0, 0, 0)
  );
}

.scorers-track {
  display: flex;
  flex-direction: column;
  will-change: transform;
  transform: translate3d(0, 0, 0);
}

.scorer {
  display: block;
}

.score-row {
  position: relative;
  display: flex;
  align-items: center;
  z-index: 100;
}

.score-large {
  position: relative;
  z-index: 11;
  font-size: 76px;
  font-style: italic;
  letter-spacing: -0.1em;
  text-indent: -0.07em;
  color: var(--text-color);
  min-width: 32px;
  text-align: center;
  transform: scale(4.5);
  overflow: visible;
  padding-bottom: 14px;
  text-shadow: 0 0px 3px rgba(0, 0, 0, 0.669);
}

.home-score-large {
  margin-left: 80px;
}

.away-score-large {
  margin-right: 80px;
}

.league-badge-large {
  transform-origin: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%) scale(1.35);
  height: 100%;
  z-index: 10;
}

.league-badge-large img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.timer-box-large {
  background: #ffffff;
  height: 60px;
  min-width: 190px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
  transform-origin: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%) translateY(-160%);
  top: 0%;
  z-index: 1;
}

.timer-text-large {
  font-size: 52px;
  color: #000000;
  letter-spacing: 0.04em;
  line-height: 1;
}
</style>
