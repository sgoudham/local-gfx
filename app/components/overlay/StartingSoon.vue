<script setup lang="ts">
import gsap from "gsap";
import type { StartingSoonProps } from "~/types";

const props = defineProps<StartingSoonProps>();

const overlay = useTemplateRef("overlay");
const rendered = ref(false);
const showMainScreen = true;

const { fundraisingInfo } = useClientState();

const kickoffTimeString = computed(() => props.kickoffTime);

function parseKickoffTime(timeString: string) {
  const [hour = 15, minute = 0] = timeString
    .split(":")
    .map((value) => Number(value));
  const kickoff = new Date();
  kickoff.setHours(
    Number.isFinite(hour) ? hour : 15,
    Number.isFinite(minute) ? minute : 0,
    0,
    0,
  );
  return kickoff;
}

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
          duration: 1,
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
          duration: 1,
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

  time.value = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const kickoff = parseKickoffTime(kickoffTimeString.value);

  if (now > kickoff) {
    kickoff.setDate(kickoff.getDate() + 1);
  }

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

let timer: NodeJS.Timeout;

onMounted(() => {
  updateClocks();
  timer = setInterval(updateClocks, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
  if (panelTimer) clearInterval(panelTimer);
});

const headline =
  "Dunterlie Dynamos and AC Malones face off in the third annual Y'morzin Cup Final";

const tickerItems = [
  {
    id: 1,
    text: "Malones goalkeeper, Danny Kelly, ruled out for final after sustaining stair-related arm injury. He will be replaced by Ciaran McKee.",
  },
  {
    id: 2,
    text: "Fan-favourite Dynamos defender, Drew 'Lennie' Maynard, won't be present for the game after being stranded on the Isle of Harris.",
  },
  {
    id: 3,
    text: "In a shock announcement, Malones manager Vinnie Collins has been replaced by former manager Jamie Dunn.",
  },
  {
    id: 4,
    text: "Malones star, James Hazlett, unavailable for the game and will miss out on a chance to extend his lead as top scorer.",
  },
  {
    id: 5,
    text: "Afters to take place at 19:00 Seventy Three, 73 Bath Street, Glasgow City Centre.",
  },
];

// --- Stat panels ---
interface StatPanel {
  id: string;
  label: string;
}

const statPanels: StatPanel[] = [
  { id: "h2h", label: "YCF Head-to-Head" },
  { id: "topscorers", label: "Top Scorers" },
  { id: "fundraiser", label: "Charity Efforts" },
];

const activePanelIndex = ref(0);
const activePanel = computed(() => statPanels[activePanelIndex.value]!);
let panelTimer: ReturnType<typeof setInterval> | null = null;

function startPanelTimer() {
  if (panelTimer) clearInterval(panelTimer);
  panelTimer = setInterval(() => {
    activePanelIndex.value = (activePanelIndex.value + 1) % statPanels.length;
  }, 8000);
}

onMounted(() => {
  startPanelTimer();
});
</script>

<template>
  <section class="overlay" ref="overlay" v-if="rendered">
    <div class="main-screen" :class="{ hidden: !showMainScreen }">
      <div class="starting-soon-panel red glossy">
        <div class="starting-soon-heading">STARTING SOON</div>
        <div class="starting-soon-name">Y'MORZIN CUP FINAL 2026</div>
        <div class="starting-soon-h2h">
          <div class="starting-soon-team">
            <div class="starting-soon-team-badge">
              <img
                src="/homeBadge.png"
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
                src="/awayBadge.png"
                alt="AC Malones Badge"
                style="width: 100%; height: 100%; object-fit: contain"
              />
            </div>
            <div class="starting-soon-team-name">AC MALONES</div>
          </div>
        </div>
        <div class="starting-soon-countdown">
          <div class="countdown-label">Kickoff at {{ kickoffTimeString }}</div>
          <div class="countdown-timer glossy">{{ countdown }}</div>
        </div>
      </div>
    </div>

    <div class="stats red glossy">
      <div class="stat-heading">{{ activePanel.label }}</div>

      <div class="stat-dots">
        <span
          v-for="(panel, i) in statPanels"
          :key="panel.id"
          class="stat-dot"
          :class="{ active: i === activePanelIndex }"
        />
      </div>

      <Transition name="panel-fade" mode="out-in">
        <div :key="activePanelIndex" class="stat-panel-body">
          <!-- H2H panel -->
          <template v-if="activePanel.id === 'h2h'">
            <div class="stat">
              <div class="stat-label">2024</div>
              <div class="stat-h2h">
                <span class="form-result w">W</span>
                <div class="stat-h2h-team">MAL</div>
                <div class="stat-h2h-score">5 - 4</div>
                <div class="stat-h2h-team">DUN</div>
                <span class="form-result l">L</span>
              </div>
              <div class="stat-label">2025</div>
              <div class="stat-h2h">
                <span class="form-result w">W</span>
                <div class="stat-h2h-team">MAL</div>
                <div class="stat-h2h-score">0 - 0</div>
                <div class="stat-h2h-team">DUN</div>
                <span class="form-result l">L</span>
              </div>
              <div class="stat-label-pens">(MAL won 4-3 on pens)</div>
            </div>
          </template>

          <!-- Top scorers panel -->
          <template v-else-if="activePanel.id === 'topscorers'">
            <div class="stat">
              <div
                v-for="(player, i) in [
                  { name: 'James Hazlett', team: 'MAL', goals: 3 },
                  { name: 'Drew Maynard', team: 'DUN', goals: 1 },
                  { name: 'Haaris Sattar', team: 'MAL', goals: 1 },
                  { name: 'John Mahon', team: 'MAL', goals: 1 },
                  { name: 'Dominic Collins', team: 'DUN', goals: 1 },
                  { name: 'Matthew Blyth', team: 'DUN', goals: 1 },
                  { name: 'Mark Harty', team: 'DUN', goals: 1 },
                  { name: 'Mark Harty', team: 'DUN', goals: 1 },
                  { name: 'Mark Harty', team: 'DUN', goals: 1 },
                ]"
                :key="i"
                class="scorer-row"
              >
                <span class="scorer-rank">{{ i + 1 }}</span>
                <span class="scorer-name">{{ player.name }}</span>
                <span class="scorer-team">{{ player.team }}</span>
                <span class="scorer-goals">{{ player.goals }}</span>
              </div>
            </div>
          </template>

          <!-- Fundraiser panel -->
          <template
            v-else-if="activePanel.id === 'fundraiser' && fundraisingInfo"
          >
            <section class="fundraiser">
              <div class="fundraiser-charity">Refuweegee</div>
              <div class="stat">
                <div class="fundraiser-total">
                  £{{ fundraisingInfo.totalRaised }}
                </div>
                <div class="fundraiser-label">
                  raised so far of £{{ fundraisingInfo.target }} target
                </div>
              </div>
              <div class="stat">
                <div class="fundraiser-total">
                  {{ fundraisingInfo.donationCount }}
                </div>
                <div class="fundraiser-label">total donations so far</div>
              </div>
            </section>
          </template>
        </div>
      </Transition>

      <div class="stat-sponsor">
        <div class="stat-sponsor-qr">
          <img
            src="/qrCode.png"
            alt="QR Code"
            style="width: 100%; height: 100%"
          />
        </div>
        <img
          class="stat-sponsor-logo"
          src="/refuweegeeLogoWhite.png"
          alt="Sponsor Logo"
        />
      </div>
    </div>

    <div class="info">
      <div class="info-top-row">
        <div class="news-title red glossy">KICK-OFF APPROACHING</div>
        <div class="news-info">
          {{ headline }}
        </div>
      </div>
      <div class="info-bottom-row">
        <div class="ycf-news">
          <div class="ycf-news-name">
            <div class="ycf-news-ycf">YCF</div>
            news
          </div>
          <div class="time">{{ time }}</div>
        </div>
        <div class="ticker glossy">
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

.main-screen.hidden {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
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
  color: var(--text-color);
  padding: 30px;
  border-radius: 8px;
  align-items: center;
  position: relative;
  animation: panelGlow 3s ease-in-out infinite;
}

@keyframes panelGlow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.08);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 255, 255, 0.18);
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
  height: 100%;
}

.starting-soon-team-badge {
  height: 200px;
  filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.5));
}

.starting-soon-team-name {
  position: relative;
  bottom: 0;
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

  padding: 15px;
  color: var(--text-color);

  display: flex;
  flex-direction: column;
  align-items: center;

  width: 25vw;
}

.stat-heading {
  font-size: 1.5882em;
  margin-bottom: 6px;
}

.stat-dots {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  transition: background 0.3s ease;
}

.stat-dot.active {
  background: var(--text-color);
}

.stat-panel-body {
  flex: 1;
  width: 100%;
  align-items: center;
  min-height: 0;
}

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.35s ease;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(0, 0, 0, 0.25);
  padding: 15px;
  border-radius: 8px;
  align-items: center;
  max-height: 90%;
  min-width: 90%;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
}

.stat-label {
  color: var(--text-color);
  margin: 5px 0 -5px 0;
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

/* Form guide */
.form-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.form-team {
  margin-right: 20px;
  font-weight: bold;
  width: 50px;
}

.form-result {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: bold;
}

.form-result.w {
  background: #2ecc71;
  color: #fff;
}
.form-result.d {
  background: #888;
  color: #fff;
}
.form-result.l {
  background: #e74c3c;
  color: #fff;
}

/* Top scorers */
.scorer-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.85em;
  width: 100%;
}

.scorer-row:last-child {
  border-bottom: none;
}

.scorer-rank {
  width: 20px;
  opacity: 0.5;
}

.scorer-name {
  flex: 1;
}

.scorer-team {
  opacity: 0.65;
  font-size: 0.85em;
}

.scorer-goals {
  background: var(--text-color);
  color: var(--ribbon-colour);
  border-radius: 4px;
  padding: 2px 8px;
  font-weight: bold;
}

.fundraiser {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.fundraiser-total {
  font-size: 2.2em;
  font-weight: bold;
  color: var(--text-color);
  line-height: 1;
}

.fundraiser-label {
  font-size: 0.75em;
  opacity: 0.7;
  margin-top: -4px;
}

.stat-sponsor {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 10px;
  bottom: 0;
  max-height: 40%;
}

.stat-sponsor-qr {
  width: 40%;
  height: auto;
  border-radius: 3%;
  overflow: hidden;
  position: relative;

  border: 1px solid rgba(237, 237, 237, 0.79);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.758),
    inset 0 5px 0 rgba(255, 255, 255, 0.9);
}

.stat-sponsor-qr::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    rgba(199, 199, 199, 0.491) 0%,
    rgba(34, 34, 34, 0.306) 40%,
    rgba(30, 30, 30, 0.331) 60%,
    rgba(156, 156, 156, 0.397) 100%
  );
  pointer-events: none;
}

.stat-sponsor-logo {
  width: 50%;
  object-fit: contain;
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
  animation: scroll-left 70s linear infinite;
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
  padding: 8px 18px;
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

  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.18) 0%,
    rgba(255, 255, 255, 0.08) 10%,
    transparent 35%
  );

  pointer-events: none;
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
      rgba(70, 120, 255, 0.25),
      transparent 50%
    ),
    radial-gradient(
      circle at 20% 20%,
      rgba(255, 255, 255, 0.06),
      transparent 40%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(255, 255, 255, 0.04),
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

  background: repeating-linear-gradient(
    -35deg,
    transparent 0,
    transparent 180px,
    rgba(255, 255, 255, 0.025) 180px,
    rgba(255, 255, 255, 0.025) 220px
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
    radial-gradient(circle at 0% 0%, rgba(80, 140, 255, 0.18), transparent 35%),
    radial-gradient(
      circle at 100% 100%,
      rgba(80, 140, 255, 0.15),
      transparent 35%
    );

  pointer-events: none;
}

.red {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--ribbon-colour), white 18%) 0%,
    var(--ribbon-colour) 45%,
    #520000 100%
  );
}

.glossy {
  position: relative;
  overflow: hidden;

  border: 1px solid rgba(255, 255, 255, 0.35);

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.18),
    inset 0 2px 6px rgba(255, 255, 255, 0.25),
    inset 0 -8px 14px rgba(0, 0, 0, 0.22),
    0 5px 14px rgba(0, 0, 0, 0.18);
}

.glossy::before {
  content: "";
  position: absolute;
  inset: -50% -80%;

  background: linear-gradient(
    110deg,
    transparent 35%,
    rgba(255, 255, 255, 0.28) 48%,
    rgba(255, 255, 255, 0.06) 55%,
    transparent 70%
  );

  transform: translateX(-60%);
  animation: glossy-shine 10s ease-in-out infinite;

  pointer-events: none;
}

.glossy::after {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: inherit;

  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.22),
    rgba(255, 255, 255, 0.04) 35%,
    transparent 65%
  );

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.22),
    inset 0 1px 8px rgba(255, 255, 255, 0.18),
    inset 0 -1px 8px rgba(0, 0, 0, 0.18);

  mix-blend-mode: soft-light;

  pointer-events: none;
}

@keyframes glossy-shine {
  0%,
  35% {
    transform: translateX(-60%);
  }

  65%,
  100% {
    transform: translateX(60%);
  }
}

.dark-glossy {
  position: relative;
  overflow: hidden;

  background: linear-gradient(180deg, #3a3a3a 0%, #151515 45%, #050505 100%);

  border: 1px solid rgba(255, 255, 255, 0.22);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    inset 0 0 18px rgba(255, 255, 255, 0.08),
    inset 0 -8px 18px rgba(0, 0, 0, 0.65),
    0 8px 20px rgba(0, 0, 0, 0.25);
}

.dark-glossy::before {
  content: "";
  position: absolute;
  inset: -60% -80%;

  background: linear-gradient(
    115deg,
    transparent 35%,
    rgba(255, 255, 255, 0.35) 48%,
    rgba(255, 255, 255, 0.08) 55%,
    transparent 70%
  );

  transform: translateX(-60%);
  animation: dark-glossy-shine 8s ease-in-out infinite;

  pointer-events: none;
}

.dark-glossy::after {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: inherit;

  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.18),
    rgba(255, 255, 255, 0.03) 35%,
    transparent 60%
  );

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.12),
    inset 0 2px 8px rgba(255, 255, 255, 0.12),
    inset 0 -2px 10px rgba(0, 0, 0, 0.5);

  mix-blend-mode: screen;

  pointer-events: none;
}

@keyframes dark-glossy-shine {
  0%,
  35% {
    transform: translateX(-60%);
  }

  65%,
  100% {
    transform: translateX(60%);
  }
}

.borderless {
  border: none !important;
  box-shadow: none !important;
}
</style>
