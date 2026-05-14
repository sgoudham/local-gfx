// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  nitro: {
    experimental: {
      websocket: true,
    },
    storage: {
      fs: {
        driver: "fs",
        base: "./_store",
      },
    },
    esbuild: {
      options: {
        target: 'esnext'
      }
    }
  },

  vite: {
    optimizeDeps: {
      include: ["zod", "gsap"],
    },
  },

  modules: ["@vueuse/nuxt", "@nuxt/fonts"],

  fonts: {
    families: [
      { name: "DM Serif Text", provider: "local" },
      { name: "Haettenschweiler", provider: "local" },
    ],
  },
});
