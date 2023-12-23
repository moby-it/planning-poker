<script setup lang="js">
const route = useRoute();
const isSpectator = ref(false);
const roomId = route.params.roomtId;
const shouldCreate = !roomId;
const title = shouldCreate ? "Create New Room" : "Joining Room";
const buttonAction = shouldCreate ? "Create Room" : "Join Room";
</script>
<template>
  <form action="/api/prejoin" method="post">
    <h2 style="text-align: center;">{{ title }}</h2>
    <label for="username">Username
      <input type="text" autocomplete="username" id="username" name="username">
    </label>
    <fieldset class="is-spectator">
      <IsSpectatorInput :model="isSpectator" @changed="(v) => console.log(v)" />
      <small>don't worry, you can change that later</small>
    </fieldset>
    <Button data-test-id="create-room" type="submit" color="primary">{{ buttonAction }}</Button>
  </form>
</template>
<style scoped>
form {
  max-width: 360px;
  margin: 100px auto 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 52px;
}

input[type='text'] {
  height: 42px;
  border-bottom: 3px solid var(--primary);
  width: 100%;
  cursor: text;
}

</style>
