<script setup lang="ts">
const links = [
  {
    label: "Hunters",
    to: "/hunters",
  },
  {
    label: "Regions",
    to: "/regions",
  },
  {
    label: "Streamers",
    to: "/streamers",
  },
  {
    label: "Games",
    to: "/games",
  },
  {
    label: "About us",
    to: "/docs",
  },
];
</script>

<template>
  <UHeader :links="links">
    <template #logo> Hunters Lodge </template>

    <template #right>
      <UserMenu />
    </template>
  </UHeader>
</template>
