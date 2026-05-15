import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const baseDir = dirname(fileURLToPath(import.meta.url));

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
        base: process.env.STORAGE_BASE ?? resolve(baseDir, "_store"),
      },
    },
    esbuild: {
      options: {
        target: "esnext",
      },
    },
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
