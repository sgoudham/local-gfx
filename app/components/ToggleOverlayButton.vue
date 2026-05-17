<script setup lang="ts">
import type { Overlay, SocketMessage } from "#imports";

const { state, publish } = useControlSocket();

const props = defineProps<{
  val: Overlay;
  name: string;
  showMessage: SocketMessage;
  hideMessage: SocketMessage;
}>();

const isOverlayVisible = (key: Overlay) => state.value.graphics[key].visible;
</script>

<template>
  <Button
    :class="isOverlayVisible(val) ? 'hide' : 'show'"
    @click="publish(isOverlayVisible(val) ? hideMessage : showMessage)"
    :label="isOverlayVisible(val) ? `Hide ${name}` : `Show ${name}`"
  />
</template>
