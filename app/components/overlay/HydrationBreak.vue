<script setup lang="ts">
import gsap from "gsap";
import type { HydrationBreakProps } from "~/types";

const props = defineProps<HydrationBreakProps>();

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
          duration: 0.75,
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
</script>

<template>
  <div class="overlay" ref="overlay" v-if="rendered">
    <div class="ribbon-box" ref="ribbonBox">
      <div class="ribbon"></div>
      <div class="ribbon"></div>
    </div>

    <div class="container">
      HYDRATION BREAK
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
  width: 30%;
  position: absolute;
  right: 2%;
  bottom: 2%;
  min-width: 500px;
}

.container {
  position: relative;
  background: #000;
  padding: 10px 90px;
  z-index: 1;
  width: 65%;
  text-align: center;
  min-width: none;
}

.ribbon-box {
  position: absolute;
  left: 0;
  transform: skewX(-30deg);
  transform-origin: center;
  overflow: visible;
  height: 100%;
  width: 100%;
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

</style>
