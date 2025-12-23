export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],

  srcDir: 'app/',

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Baby-Foot Tournament Manager',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Manage your foosball tournaments with ease' }
      ]
    }
  }
})
