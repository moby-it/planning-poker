<script setup lang="ts">
defineProps<{
  voted?: boolean,
  revealed?: boolean,
  points: number;
}>();
</script>
<template>
  <div :class="{ revealed, voted }" class="vote">
    <div class="card"></div>
    <p v-if="points === 1000"><img src="/cup-medium.svg" /></p>
    <p v-else-if="points === 100">?</p>
    <p v-else>{{ points }}</p>
  </div>
</template>
<style>
.card,
.voting-card {
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 3.23328px 3.23328px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  background-color: var(--white);
}

.card {
  width: 64px;
  height: 88px;
}

.voting-card {
  width: 44px;
  height: 60px;
}

.voted {
  background-color: var(--primary);
}

.revealed {
  background-color: var(--white);
  color: var(--primary--dark);
}

.card span {
  font-size: 1.75rem;
  line-height: 35px;
}

.voting-card span {
  font-size: 1.375rem;
  line-height: 28px;
}

.voting-card.selected {
  color: var(--white);
  background-color: var(--primary);
}

.voting-card:hover {
  cursor: pointer;
  box-sizing: border-box;
  border: 2px solid var(--primary);
}
</style>