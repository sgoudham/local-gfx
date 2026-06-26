<script setup lang="ts">
import type { TeamLocation } from "~~/shared/types/data";

const props = defineProps<{
  onClick?: () => void;
  disabled?: boolean;
  location?: TeamLocation;
}>();
</script>

<template>
  <button
    :data-location="props.location"
    :class="['button', { disabled: props.disabled }]"
    @click="props.onClick"
    :disabled="props.disabled"
  >
    <slot />
  </button>
</template>

<style lang="css" scoped>
.button[data-location="home"] {
  --primary-colour: var(--home-colour-1);
  --secondary-colour: var(--home-colour-2);
}

.button[data-location="away"] {
  --primary-colour: var(--away-colour-1);
  --secondary-colour: var(--away-colour-2);
}

.button {
  background: #d32f2f;
  border: 0;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 10px;
  transition:
    filter 120ms ease,
    transform 120ms ease;
}
.button:hover {
  filter: brightness(1.05);
}
.button:active {
  transform: translateY(1px);
}
.button.hide {
  background: #11111b;
}
.button.disabled {
  color: #9ca0b0;
  background-color: #ccd0da;
  cursor: not-allowed;
}
.action {
  background-color: #1e66f5;
}
.team {
  background-color: var(--primary-colour);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.neutral {
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
