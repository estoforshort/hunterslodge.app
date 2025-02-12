// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-10-11",
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
  future: { compatibilityVersion: 4 },
  extends: ["@nuxt/ui-pro"],
  modules: [
    "@nuxt/ui",
    "@nuxt/eslint",
    "nuxt-auth-utils",
    "@nuxt/image",
    "@nuxt/content",
  ],
  runtimeConfig: {
    oauth: {
      twitch: {
        clientId: "",
        clientSecret: "",
        redirectURL: "",
      },
    },
    public: {
      baseUrl: "",
    },
  },
  nitro: {
    storage: {
      cache: {
        driver: "redis",
      },
      images: {
        driver: "fs",
        base: "./images",
      },
    },
  },
  routeRules: {
    "/api/content": { prerender: true },
    "/docs": { redirect: "/docs/getting-started", prerender: false },
  },
  image: {
    domains: ["localhost:3000", "hunterslodge.app"],
  },
});
