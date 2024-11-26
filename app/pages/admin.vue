<script setup lang="ts">
useSeoMeta({
  title: "Administration",
});

const links = [
  [
    {
      label: "Overview",
      icon: "i-heroicons-squares-2x2",
      to: "/admin",
      exact: true,
    },
  ],
  [
    {
      label: "Settings",
      icon: "i-heroicons-adjustments-horizontal",
      to: "/admin/settings",
    },
  ],
];
</script>

<template>
  <UPage>
    <UPageBody>
      <UHorizontalNavigation :links="links" />

      <UCard>
        <NuxtPage />
      </UCard>
    </UPageBody>
  </UPage>
</template>
