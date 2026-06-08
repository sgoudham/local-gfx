<script setup lang="ts">
import gsap from "gsap";
import type { StartingSoonProps } from "~/types";

const props = defineProps<StartingSoonProps>();

const overlay = useTemplateRef("overlay");
const rendered = ref(false);

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

const time = ref("");
const countdown = ref("");

function updateClocks() {
  const now = new Date();

  // Current time
  time.value = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Next 13:00
  const kickoff = new Date();
kickoff.setHours(13, 0, 0, 0);

if (now > kickoff) {
  kickoff.setDate(kickoff.getDate() + 1);
}

  // If it's already past 13:00, show 00:00:00
  const diff = Math.max(0, kickoff.getTime() - now.getTime());

  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  countdown.value = [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
}

let timer: ReturnType<typeof setInterval>;

onMounted(() => {
  updateClocks();
  timer = setInterval(updateClocks, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});

const tickerItems = [
  {
    id: 1,
    text: "Malones goalkeeper, Danny Kelly, ruled out for final after sustaining stair-related arm injury. He is set to be replaced by ..."
  },
  {
    id: 2,
    text: "Fan-favourite Dynamos defender, Drew 'Lennie' Maynard, won't be present for the game after being stranded on the Isle of Harris."
  },
  {
    id: 3,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel sapien augue. Donec vel sapien augue."
  },
  {
    id: 4,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel sapien augue. Donec vel sapien augue."
  },
  {
    id: 5,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel sapien augue. Donec vel sapien augue."
  }
];

</script>

<template>
  <section class="overlay" ref="overlay" v-if="rendered">
    <div class="main-screen">
      <div class="starting-soon-panel">
        <div class="starting-soon-heading">STARTING SOON</div>
        <div class="starting-soon-name">Y'MORZIN CUP FINAL 2026</div>
        <div class="starting-soon-h2h">
          <div class="starting-soon-team">
            <div class="starting-soon-team-badge">
              <img
                src="../../assets/homeBadge.png"
                alt="Dunterlie Dynamos Badge"
                style="width: 100%; height: 100%; object-fit: contain"
              />
            </div>
            <div class="starting-soon-team-name">DUNTERLIE DYNAMOS</div>
          </div>
          <div class="starting-soon-vs">VS</div>
          <div class="starting-soon-team">
            <div class="starting-soon-team-badge">
              <img
                src="../../assets/awayBadge.png"
                alt="AC Malones Badge"
                style="width: 100%; height: 100%; object-fit: contain"
              />
            </div>
            <div class="starting-soon-team-name">AC MALONES</div>
          </div>
        </div>
        <div class="starting-soon-countdown">
          <div class="countdown-label">Kickoff at 13:00</div>
          <div class="countdown-timer">{{ countdown }}</div>
        </div>
      </div>
    </div>

    <div class="stats">
      <div class="stat-heading">
        YCF Head-to-Head
      </div>
      <div class="stat">
        <div class="stat-label">
          2024
        </div>
        <div class="stat-h2h">
          <div class="stat-h2h-team">
            MAL
          </div>
          <div class="stat-h2h-score">
            5 - 4
          </div>
          <div class="stat-h2h-team">
            DUN
          </div>
        </div>
        <div class="stat-label">
          2025
        </div>
        <div class="stat-h2h">
          <div class="stat-h2h-team">
            MAL
          </div>
          <div class="stat-h2h-score">
            0 - 0
          </div>
          <div class="stat-h2h-team">
            DUN
          </div>
        </div>
        <div class="stat-label-pens">
          (MAL won 4-3 on pens)
        </div>
      </div>
    </div>
    <div class="info">
      <div class="info-top-row">
        <div class="news-title">KICK-OFF APPROACHING</div>
        <div class="news-info">
          Dunterlie Dynamos and AC Malones face off in the third annual Y'morzin Cup Final
        </div>
      </div>
      <div class="info-bottom-row">
        <div class="ycf-news">
          <div class="ycf-news-name">
            <div class="ycf-news-ycf">YCF</div>news</div>
          <div class="time">{{ time }}</div>
        </div>
        <div class="ticker">
          <div class="ticker-track">
            <div
              v-for="copy in 2"
              :key="copy"
              class="ticker-group"
              :aria-hidden="copy === 2"
            >
              <div
                v-for="item in tickerItems"
                :key="`${copy}-${item.id}`"
                class="ticker-text"
              >
                <div class="ticker-separator">Breaking News</div>
                {{ item.text }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.overlay {
  --base-font-size: 34px;

  position: fixed;
  inset: 0;

  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: 1fr auto;

  pointer-events: none;
  font-family: var(--font-display);
  font-size: var(--base-font-size);
  color: var(--text-color-secondary);
}

.main-screen {
  grid-column: 1;
  grid-row: 1;

  background: rgb(23, 28, 97);

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 40px;
  min-height: 0;

  position: relative;
  overflow: hidden;
}

.main-screen::before {
  content: "";
  position: absolute;
  inset: -20%;
  opacity: 0.08;

  background:
    radial-gradient(circle at 20% 20%, white 0%, transparent 25%),
    radial-gradient(circle at 80% 60%, white 0%, transparent 30%);

  animation: bgDrift 20s linear infinite;
}

@keyframes bgDrift {
  from {
    transform: translateX(-5%) translateY(-2%);
  }
  to {
    transform: translateX(5%) translateY(2%);
  }
}

.starting-soon-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: linear-gradient(var(--ribbon-colour), #000);
  color: var(--text-color);
  padding: 30px;
  border-radius: 8px;
  align-items: center;
  position: relative;
  animation: panelGlow 3s ease-in-out infinite;
}

@keyframes panelGlow {
  0%,100% {
    box-shadow: 0 0 20px rgba(255,255,255,0.08);
  }
  50% {
    box-shadow: 0 0 40px rgba(255,255,255,0.18);
  }
}

.starting-soon-heading {
  font-size: 3.5294em;
}

.starting-soon-name {
  margin-top: -50px;
  font-size: 2em;
  font-style: italic;
}

.starting-soon-h2h {
  display: flex;
  align-items: center;
  gap: 40px;
}

.starting-soon-team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 400px;
}

.starting-soon-team-badge {
  width: 200px;
  filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.5));
}

.starting-soon-team-name {

}

.starting-soon-vs {
  font-size: 1.8824em;
}

.starting-soon-countdown {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 50%;
}

.countdown-label {
  font-size: 1.2353em;
}

.countdown-timer {
  position: relative;
  overflow: hidden;
  font-size: 1.4118em;
  background: var(--text-color);
  color: var(--ribbon-colour);
  padding: 10px 40px;
  border-radius: 8px;
  align-self: stretch;
  text-align: center;
  letter-spacing: 0.2em;
}

.stats {
  grid-column: 2;
  grid-row: 1;

  background: linear-gradient(var(--ribbon-colour), #000);
  padding: 15px;
  color: var(--text-color);

  display: flex;
  flex-direction: column;
}

.stat-heading {
  font-size: 1.5882em;
  margin-bottom: 10px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(0, 0, 0, 0.25);
  padding: 15px;
  border-radius: 8px;
  align-items: center;
}

.stat-label {
  color: var(--text-color);
  margin: 10px 0 -10px 0;
}

.stat-h2h {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-h2h-team {
  font-weight: bold;
}

.stat-h2h-score {
  padding: 5px 15px;
  border-radius: 4px;
  background: var(--text-color);
  color: var(--ribbon-colour);
}

.stat-label-pens {
  font-size: 0.7059em;
  position: relative;
  margin-top: -10px;
}

.info {
  grid-column: 1 / -1;
  grid-row: 2;

  display: flex;
  flex-direction: column;
  background: rgb(237, 237, 237);
}

.info-top-row {
  display: flex;
  gap: 20px;
  position: relative;
  top: 0;
  align-items: center;
}

.news-title {
  padding: 35px 30px;
  font-family: var(--font-secondary);
  font-size: 74px;
  background: linear-gradient(var(--ribbon-colour), #000);
  color: var(--text-color);
  font-size: 2.1765em;
  display: flex;
  align-items: center;
}

.news-info {
  flex: 1;
  display: flex;
  align-items: center;
  padding-right: 30px;
}

.info-bottom-row {
  display: flex;
  gap: 10px;
}

.ycf-news {
  display: flex;
  gap: 10px;
  align-items: center;
  padding-left: 20px;
}

.ycf-news-name {
  display: flex;
  gap: 5px;
  align-items: center;
  margin: 5px 0;
  font-style: italic;
}

.ycf-news-ycf {
  background: var(--ribbon-colour);
  padding: 2px 10px;
  color: var(--text-color);
  border-radius: 4px;
  font-style: normal;
}

.time {
  margin: 0 20px;
}

.ticker {
  flex: 1;
  overflow: hidden;
  display: flex;
  position: relative;
  align-items: center;
  background: #f4b12c;
}

.ticker-track {
  display: inline-flex;
  white-space: nowrap;
  min-width: max-content;
  flex-shrink: 0;
  animation: scroll-left 60s linear infinite;
}

.ticker-text {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  flex-shrink: 0;
}

.ticker-separator {
  display: inline-block;
  background: var(--text-color-secondary);
  color: #f4b12c;
  padding: 7px 18px;
  margin: 0 20px;
}

@keyframes scroll-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.starting-soon-panel,
.stats,
.news-title {
  position: relative;
  overflow: hidden;
}

.starting-soon-panel::before,
.stats::before,
.news-title::before {
  content: "";
  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      180deg,
      rgba(255,255,255,0.18) 0%,
      rgba(255,255,255,0.08) 10%,
      transparent 35%
    );

  pointer-events: none;
}

.starting-soon-panel::after,
.stats::after,
.news-title::after {
  content: "";
  position: absolute;

  left: -20px;
  top: -150px;

  width: 150%;
  height: 100px;

  background:
    linear-gradient(
      180deg,
      transparent,
      rgba(255, 255, 255, 0.053),
      rgba(255, 255, 255, 0.123),
      rgba(255, 255, 255, 0.043),
      transparent
    );

  filter: blur(4px);


  animation: shineSweep 20s linear infinite;
}

@keyframes shineSweep {
  from {
    top: -150px;
  }

  to {
    top: calc(100% + 150px);
  }
}

.main-screen {
  position: relative;
  overflow: hidden;

  background:
    radial-gradient(
      circle at 50% 40%,
      rgba(70,120,255,0.25),
      transparent 50%
    ),
    radial-gradient(
      circle at 20% 20%,
      rgba(255,255,255,0.06),
      transparent 40%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(255,255,255,0.04),
      transparent 40%
    ),
    linear-gradient(
      180deg,
      rgb(32, 40, 135) 0%,
      rgb(16, 21, 78) 50%,
      rgb(8, 10, 35) 100%
    );
}

.main-screen::before {
  content: "";
  position: absolute;

  background:
    repeating-linear-gradient(
      -35deg,
      transparent 0,
      transparent 180px,
      rgba(255,255,255,0.025) 180px,
      rgba(255,255,255,0.025) 220px
    );

  animation: streakDrift 30s linear infinite;
}

@keyframes streakDrift {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(300px);
  }
}

.main-screen::after {
  content: "";
  position: absolute;
  inset: 0;

  background:
    radial-gradient(
      circle at 0% 0%,
      rgba(80,140,255,0.18),
      transparent 35%
    ),
    radial-gradient(
      circle at 100% 100%,
      rgba(80,140,255,0.15),
      transparent 35%
    );

  pointer-events: none;
}

</style>
