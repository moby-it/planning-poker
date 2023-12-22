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
    <p>We got tired of searching for free solution for doing Scrum Poker Planning, so we decided to solve the issue
      ourselves and open-source it.</p>
    <img src="~/assets/home-illustration.png">
  </section>
</template>
<style>
#home {

  display: grid;
  grid-template-columns: 1.5fr 0.5fr;
  grid-template-rows: 168px 30px 90px;
  grid-template-areas:
    "title illustration"
    "tags illustration"
    "description illustration"
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

p {
  grid-area: description;
}

img {
  grid-area: illustration;
  width: 100%;
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