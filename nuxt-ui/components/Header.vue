<script setup lang="ts">

</script>
<template>
  <nav>
    <NuxtLink to="/">
      <hgroup>
        <img src="/favicon.ico" height="26">
        <h4>Poker Planning</h4>
      </hgroup>
    </NuxtLink>
    <p>Made By <a>Moby IT</a> </p>
  </nav>
</template>
<style scoped>
nav {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

hgroup {
  display: flex;
  align-items: center;
  gap: 5px;
}

a:not(nav > a){
  color: #2a55d4cc;
}
</style>