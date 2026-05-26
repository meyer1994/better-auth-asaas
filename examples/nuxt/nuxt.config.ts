// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt'
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2024-07-11',

  vite: {
    server: {
      allowedHosts: ['dev.jmeyer.dev']
    },
    optimizeDeps: {
      include: ['zod', 'better-auth/client', 'better-auth/client/plugins']
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
