<script setup lang="ts">
const links = [
  {
    label: "Privacy Policy",
    to: "/docs/getting-started/privacy",
  },
  {
    label: "Cookie Policy",
    to: "/docs/getting-started/cookies",
  },
  {
    label: "Terms of Service",
    to: "/docs/getting-started/tos",
  },
];
</script>

<template>
  <UFooter :links>
    <template #left>
      Created with <UIcon name="i-bi-heart" /> by
      <NuxtLink to="https://www.twitch.tv/estoforshort" target="_blank">
        EstoForShort
      </NuxtLink>
    </template>

    <template #right>
      <UColorModeButton />

      <UButton
        icon="i-simple-icons-discord"
        color="gray"
        variant="ghost"
        to="https://discord.gg/QYNsXnMMnA"
        target="_blank"
      />

      <UButton
        icon="i-simple-icons-github"
        color="gray"
        variant="ghost"
        to="https://github.com/estoforshort/hunterslodge.app"
        target="_blank"
      />
    </template>
  </UFooter>
</template>
