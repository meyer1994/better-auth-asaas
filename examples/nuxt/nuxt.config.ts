// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@vueuse/nuxt', '@nuxt/ui'],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2026-05-26',

  vite: {
    server: {
      allowedHosts: ['dev.jmeyer.dev'],
    },
    optimizeDeps: {
      include: [
        'better-auth/client',
        'better-auth/vue',
        'zod',
      ],
    },
  },

  eslint: {
    config: { stylistic: true },
  },
})
