<script setup lang="ts">
const colorMode = useColorMode();

const color = computed(() =>
  colorMode.value === "dark" ? "#111827" : "white",
);

useHead({
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { key: "theme-color", name: "theme-color", content: color },
  ],
  link: [{ rel: "icon", href: "/favicon.ico" }],
  htmlAttrs: {
    lang: "en",
  },
});

const title = "Hunters Lodge";
const description = "The web app for PlayStation trophy hunters on Twitch.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: "/logo.png",
});
</script>

<template>
  <UMain>
    <UContainer>
      <UPage>
        <div class="grid h-screen place-items-center">
          <ULandingHero
            title="We'll be back soon™"
            :links="[
              {
                icon: 'i-simple-icons-discord',
                to: 'https://discord.gg/QYNsXnMMnA',
                target: '_blank',
                color: 'black',
                size: 'md',
              },
              {
                icon: 'i-simple-icons-github',
                to: 'https://github.com/estoforshort/hunterslodge.app',
                target: '_blank',
                color: 'black',
                size: 'md',
              },
              {
                icon: 'i-simple-icons-patreon',
                to: 'https://www.patreon.com/estoforshort',
                target: '_blank',
                color: 'black',
                size: 'md',
              },
            ]"
          />
        </div>
      </UPage>
    </UContainer>
  </UMain>
</template>
