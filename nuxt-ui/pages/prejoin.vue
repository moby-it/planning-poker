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
      <label for="is-spectator">
        Join as Spectator
      </label>
      <input type="checkbox" id="is-spectator" name="is-spectator" v-model="isSpectator"
        @change="(event) => console.log('change', event?.target?.checked)">
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

.is-spectator {
  display: grid;
  row-gap: 14px;
  grid-template-columns: 300px 16px;
  grid-template-areas:
    "label checkbox"
    "caption caption"
  ;
}

.is-spectator small {
  grid-area: caption;
  font-size: 0.75rem;
}

.is-spectator label {
  grid-area: label;
}

.is-spectator input {
  grid-area: checkbox;
}

#is-spectator {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 1px solid black;
  border-radius: 5px;
}

#is-spectator:checked {
  background: url("/check.svg");
  background-size: contain;
}
</style>
