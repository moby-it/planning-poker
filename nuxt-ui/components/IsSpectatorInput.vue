<script setup >
defineProps({
  model: Boolean
});
defineEmits(['changed']);
</script>
<template>
  <label for="is-spectator">
    Join as Spectator
  </label>
  <input type="checkbox" id="is-spectator" name="is-spectator" :checked="model"
    @change="(event) => $emit('changed', event.target.checked)">
</template>
<style>
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