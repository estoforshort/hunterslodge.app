<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

useSeoMeta({
  title: "Settings",
});
</script>

<template>
  <UPage>
    <UPageBody>
      <UCard>
        <SettingsOverlaySettings />
      </UCard>
    </UPageBody>
  </UPage>
</template>
