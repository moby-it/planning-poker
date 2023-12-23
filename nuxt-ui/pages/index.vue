<script setup lang="ts">
definePageMeta({
  layout: 'home-layout',
});
useSeoMeta({
  title: 'Poker Planning',
});
</script>
<template>
  <section>
    <hgroup>
      <NuxtImg src="/icon-lg.svg" width="105" height="98" />
      <h1 data-testid="title">Poker Planning</h1>
    </hgroup>
    <ul>
      <li>
        <NuxtImg src="/check.svg" alt="check" srcset="" />user-friendly
      </li>
      <li>
        <NuxtImg src="/github.svg" alt="github" srcset="" />
        <a href="https://github.com/moby-it/planning-poker" target="_blank"><em>open-sourced</em></a>
      </li>
      <li>
        <NuxtImg src="/check.svg" alt="check" srcset="" />free forever
      </li>
    </ul>
    <p>We got tired of searching for free solution for doing <em>Scrum Poker Planning</em>, so we decided to solve the
      issue
      ourselves and open-source it.</p>
    <NuxtImg id="home-illustration" src="/home-illustration.png" />
    <Button :disabled="false" :color="'primary'" @clicked="navigateTo('/prejoin')">
      Start Here
    </Button>
  </section>
</template>
<style scoped>
section {
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 168px min-content min-content 1fr;
  grid-template-areas:
    "title title"
    "tags ."
    "description ."
    "button button";

  margin-top: 72px;
  margin-left: 36px;
  font-size: 20px;

}

p {
  line-height: 30px;
  grid-area: description;
  margin-bottom: 42px;
}

button {
  grid-area: button;
}

em {
  text-decoration: underline;
}

ul {
  grid-area: tags;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

li {
  display: flex;
  align-items: center;
  gap: 6px;
}

p,
li {
  font-family: IBM Plex Mono, monospace;
}

hgroup {
  grid-area: title;
  display: flex;
  align-items: center;
  font-size: 4.25rem;
}

#home-illustration {
  position: absolute;
  right: 0;
  bottom: 0px;
  width: 40%;
  opacity: 0.3;
}
</style>