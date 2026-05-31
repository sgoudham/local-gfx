<script setup lang="ts">
const props = defineProps<{
  label: string;
  onClick?: () => void;
}>();
</script>

<template>
  <button class="button" @click="onClick">
    {{ label }}
  </button>
</template>

<style scoped>
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
  background: #6b7280;
}
.action {
  background-color: #1e66f5;
}
</style>
