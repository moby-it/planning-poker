<script setup lang="ts">
definePageMeta({
  layout: 'home-layout',
});
useSeoMeta({
  title: 'Poker Planning',
});
</script>
<template>
  <section id="home">
    <section class="bg"></section>
    <hgroup>
      <img src="~/assets/icon-lg.svg" width="105" height="98" alt="" srcset="" />
      <h1 data-testid="title">Poker Planning</h1>
    </hgroup>
    <ul>
      <li> <img src="~/assets/check.svg" alt="check" srcset="" />user-friendly</li>
      <li> <img src="~/assets/github.svg" alt="github" srcset="" /><a href="https://github.com/moby-it/planning-poker"
          target="_blank"><em>open-sourced</em></a></li>
      <li> <img src="~/assets/check.svg" alt="check" srcset="" />free forever</li>
    </ul>
    <p>We got tired of searching for free solution for doing <em>Scrum Poker Planning</em>, so we decided to solve the
      issue
      ourselves and open-source it.</p>
    <img src="~/assets/home-illustration.png">
    <Button :disabled="false" :color="'primary'" @clicked="navigateTo('/prejoin?create=1')">
      Start Here
    </Button>
  </section>
</template>
<style>
#home {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 168px 30px 90px 1fr;
  grid-template-areas:
    "title title ."
    "tags illustration illustration"
    "description illustration illustration"
    "button illustration illustration"
  ;
  gap: 16px;
  margin-top: 72px;
  margin-left: 36px;

  font-size: 20px;
}

#home .bg {
  background: url(~/assets/home-illustration.png);
  opacity: 0.6;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: auto;

}

p {
  line-height: 30px;
  grid-area: description;

}
button {
  grid-area: button;
  justify-self: center;
}
em {
  text-decoration: underline;
}

ul {
  grid-area: tags;
  display: flex;
  align-items: center;
  gap: 12px;
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

img {
  grid-area: illustration;
  /* width: 100%; */
  height: 500px;
}

hgroup {
  grid-area: title;
  display: flex;
  align-items: center;
  font-size: 4.25rem;
}

hgroup img {
  width: 98px;
}

hgroup h1 {
  flex: 1;
}

li img {
  width: 20px;
}
</style>