<script setup >
const params = useRoute().query;
const username = params.username;
const isSpectator = ref(params.isSpectator === "true");
const roomHeader = ref("Voting Task...");
function copyLink() { navigator.clipboard.writeText(location.href); }
const users = [
  { username: 'george', voted: false, points: null },
  { username: 'maria', voted: false, points: null },
  { username: 'konnos', voted: true, points: null }
];
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
  <section class="board">
    <section class="user-vote" v-for="user of users">
      <Card :points="user.points" :revealed="user.revealed" :voted="user.voted" />
      <p>{{ user.username }}</p>
    </section>
  </section>
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
.board {
  display: flex;
  justify-content: center;
  gap: 20px;
  max-width: 770px;
  flex-wrap: wrap;
}
.vote {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 138px;
  height: 128px;
}
.vote .username {
  font-size: 1rem;
  line-height: 20px;
}

</style>