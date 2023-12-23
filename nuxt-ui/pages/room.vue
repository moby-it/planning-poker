<script setup >
const params = useRoute().query;
const username = params.username;
const isSpectator = ref(params.isSpectator === "true");
const roomHeader = ref("Voting Task...");
function copyLink() { navigator.clipboard.writeText(location.href); }
</script>
<template>
  <section class="room-header">
    <h2>{{ roomHeader }}</h2>
  </section>
  <ul class="room-actions">
    <li><a style="color:var(--primary)" @click="copyLink">Copy Invite Link</a>
    </li>
    <li>
      <IsSpectatorInput @changed="(v) => isSpectator = v" :model="isSpectator" />
    </li>
  </ul>
  <h1>Hello from room</h1>
  <p>username: {{ username }}</p>
  <p>is Spectator: {{ isSpectator }} </p>
</template>
<style scoped>
.room-header h2 {
  padding: 25px 0;
  text-align: center;
}

.room-actions {
  display: flex;
  justify-content: space-between;
}

.room-actions li:nth-child(2) {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>