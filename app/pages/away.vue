<script setup lang="ts">
const { state, publish } = useOutputSocket();
publish(SocketMessage.SessionRegister);
</script>

<template>
  <SocialMediaPlayers v-bind="state.away" />
</template>
