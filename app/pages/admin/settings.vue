<script setup lang="ts">
definePageMeta({
  middleware: "admin",
});
</script>

<template>
  <div>
    <AdminSettingsTokensManager />
    <AdminSettingsFeaturesManager />
  </div>
</template>
