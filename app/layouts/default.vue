<script setup lang="ts">
import type { ParsedContent } from "@nuxt/content";

const { data: navigation } = await useAsyncData(
  "navigation",
  () => fetchContentNavigation(),
  { default: () => [] },
);

const { data: files } = useLazyFetch<ParsedContent[]>("/api/content", {
  default: () => [],
  server: false,
});

provide("navigation", navigation);
</script>

<template>
  <div>
    <div id="top" />
    <AppHeader />

    <UMain>
      <UContainer>
        <slot />
      </UContainer>
    </UMain>

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch :files="files" :navigation="navigation" />
    </ClientOnly>
  </div>
</template>
