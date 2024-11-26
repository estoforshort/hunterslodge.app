<script setup lang="ts">
const links = [
  {
    label: "Hunters",
    to: "/hunters",
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
