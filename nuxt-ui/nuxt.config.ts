// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/image"],
  $production: {
    app: {
      head: {
        link: [
          { rel: 'shortcut icon', type: 'image/ico', href: "/favicon.ico" },
          {
            rel: 'stylesheet', href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Sora&display=swap"
          }]
      }
    },
    routeRules: {
      '/': { prerender: true },
    }
  },
  $development: {
    devtools: { enabled: true }
  }
});
