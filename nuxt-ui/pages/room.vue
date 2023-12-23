<script setup lang="ts">
const params = useRoute().query;
</script>
<template>
  <h1>Hello from room</h1>
  <p>username: {{ params.username }}</p>
  <p>is Spectator: {{ params.isSpectator }}</p>
</template>