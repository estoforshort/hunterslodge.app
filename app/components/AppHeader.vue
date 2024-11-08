<script setup lang="ts">
const links = [
  {
    label: "Leaderboard",
    to: "/",
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
