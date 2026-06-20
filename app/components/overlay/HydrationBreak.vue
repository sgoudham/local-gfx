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

<template>
  <div class="overlay" ref="overlay" v-if="rendered">
    HYDRATION BREAK
  </div>
</template>

<style scoped>
.overlay {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  font-family: var(--font-display);
  color: var(--text-color);
  padding: 16px;
  overflow: visible;
  top: 10px;
}
</style>
