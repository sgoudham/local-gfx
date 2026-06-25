<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src: string;
    baseWidth?: number;
    baseHeight?: number;
  }>(),
  {
    baseWidth: 1920,
    baseHeight: 1080,
  },
);

const viewport = ref<HTMLElement | null>(null);
const scale = ref(1);
let resizeObserver: ResizeObserver | null = null;

function updateScale() {
  if (!viewport.value) {
    return;
  }

  const baseWidth = Math.max(1, props.baseWidth);
  const baseHeight = Math.max(1, props.baseHeight);
  const widthRatio = viewport.value.clientWidth / baseWidth;
  const heightRatio = viewport.value.clientHeight / baseHeight;
  scale.value = Math.max(0.01, Math.min(widthRatio, heightRatio));
}

onMounted(() => {
  nextTick(() => {
    updateScale();

    if (!viewport.value) {
      return;
    }

    resizeObserver = new ResizeObserver(() => {
      updateScale();
    });
    resizeObserver.observe(viewport.value);
  });
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});

watch(
  () => [props.baseWidth, props.baseHeight],
  () => {
    updateScale();
  },
);
</script>

<template>
  <div class="preview-card">
    <slot />
    <div
      ref="viewport"
      class="frame-viewport"
      :style="{ '--frame-aspect': `${baseWidth} / ${baseHeight}` }"
    >
      <div
        class="frame-stage"
        :style="{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          '--frame-scale': scale,
        }"
      >
        <iframe class="graphics-frame" :src="src"></iframe>
      </div>
    </div>
  </div>
</template>

<style scoped>
.frame-viewport {
  position: relative;
  width: 100%;
  aspect-ratio: var(--frame-aspect, 16 / 9);
  overflow: hidden;
  border-radius: 4px;
  border: 2px solid #11111b;
}

.frame-stage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(var(--frame-scale));
  transform-origin: center center;
}

.graphics-frame {
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
