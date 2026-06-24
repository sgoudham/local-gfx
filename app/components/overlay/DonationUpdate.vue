<script setup lang="ts">
import gsap from "gsap";
import type { DonationUpdateProps } from "~/types";

const { donations } = useClientState();
const percentage = computed(() => donations.value?.percentage ?? 0);
const target = computed(() => donations.value?.target ?? 0);
const totalRaised = computed(() => donations.value?.totalRaised ?? 0);

const props = defineProps<DonationUpdateProps>();

const overlay = useTemplateRef("overlay");
const rendered = ref(false);

const charityName = "Refuweegee";

// Not really sure what this nextTick() -> nextTick() stuff is about but progress bar was not appearing initially without it
// Just wanted a quick solution so using AI answer for now
async function show() {
  await nextTick()

  rendered.value = true

  await nextTick()

  if (overlay.value) {
    gsap.fromTo(
      overlay.value,
      { opacity: 0, y: -10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      }
    )
  }
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

<template>
  <div class="overlay" ref="overlay" v-if="rendered">
    <div class="extra-info">
      <div class="container red glossy">
        <div class="stat-sponsor">
          <div class="stat-sponsor-qr">
            <img
            src="/qrCode.png"
            alt="QR Code"
            style="width: 100%; height: 100%;"
          />
          </div>
        </div>
        <div class="donation-updates">
          <div class="charity-title">
            {{ charityName }}
          </div>
          <div>Total raised:</div>
          <div>£{{ totalRaised }}</div>
          <div class="progress-bar-back">
            <div
              class="progress-bar-front"
              :style="{ width: `${percentage}%` }"
            ></div>
          </div>
          <div class="progress-label">
            {{ percentage }}% of £{{ target }} target
          </div>
        </div>
      </div>
      <div class="donation-link">
        www.justgiving.com/page/ymorzin-cup-final-26
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  --base-font-size: 36px;

  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: var(--base-font-size);
  color: var(--text-color);
  padding: 0 16px;
  overflow: visible;
  width: 35dvw;
  position: absolute;
  right: 2%;
  top: 2%;
}

.extra-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #c3c3c3;
}

.donation-link {
  width: 95%;
  font-size: 0.8em;
  z-index: 1;
  margin: 0.3em 0 0.3em 0;
  text-align: center;
  color: #000;
  font-weight: bold;
}

.container {
  position: relative;
  padding: 0.1em 1em;
  z-index: 1;
  text-align: center;
  min-width: none;
  display: flex;
  gap: 1em;
}

.donation-updates {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 60%;
}

.stat-sponsor {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40%;
  gap: 0.5em;
}

.stat-sponsor-qr {
  border-radius: 3%;
  overflow: hidden;
  position: relative;

  border: 1px solid rgba(237, 237, 237, 0.79);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.758),
    inset 0 5px 0 rgba(255, 255, 255, 0.9);
}

.stat-sponsor-qr::after {
  content: '';
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

.charity-title {
  font-size: 1.2em;
  font-weight: 700;
  margin-bottom: 0.5em;
  letter-spacing: 0.06em;
}

.progress-bar-back {
  width: 100%;
  height: 0.2em;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  overflow: hidden;
  margin: 0.5em 0;
}

.progress-bar-front {
  height: 100%;
  background: linear-gradient(90deg, #6ee7b7 0%, #22d3ee 100%);
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.2);
  transition: width 0.4s ease;
}

.progress-label {
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.75);
}

.red {
  background:
    linear-gradient(
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
  content: '';
  position: absolute;
  inset: -50% -80%;

  background:
    linear-gradient(
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
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: inherit;

  background:
    linear-gradient(
      180deg,
      rgba(255,255,255,0.22),
      rgba(255,255,255,0.04) 35%,
      transparent 65%
    );

  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.22),
    inset 0 1px 8px rgba(255,255,255,0.18),
    inset 0 -1px 8px rgba(0,0,0,0.18);

  mix-blend-mode: soft-light;

  pointer-events: none;
}

</style>
