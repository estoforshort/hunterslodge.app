<script setup lang="ts">
const route = useRoute();

const { data: game } = await useFetch(
  `/api/public/v1/stacks/${route.params.game}`,
  {
    transform: (game) => {
      if (!game.data) {
        return null;
      }

      return {
        stackId: game.data.id,
        gameId: game.data.gameId,
        name: game.data.game.name,
        platforms: game.data.game.platforms,
      };
    },
  },
);

useSeoMeta({
  title: game.value?.name,
});

console.log(route.name);

const links = computed(() => [
  [
    {
      label: "Summary",
      icon: "i-bi-grid",
      to: `/games/${game.value?.stackId}`,
      exact: true,
    },
    {
      label: "Trophies",
      icon: "i-bi-trophy",
      to: `/games/${game.value?.stackId}/trophies`,
      active:
        route.name === "games-game-trophies"
          ? true
          : route.name === "games-game-trophies-group"
            ? true
            : false,
    },
  ],
  [
    {
      label: "Charts",
      icon: "i-bi-graph-up",
      to: `/games/${game.value?.stackId}/charts`,
      exact: true,
    },
  ],
]);

const config = useRuntimeConfig();
</script>

<template>
  <UPage>
    <UPageBody v-if="game">
      <div class="flex justify-center">
        <NuxtImg
          :src="`${config.public.baseUrl}/images/games/${game.gameId}`"
          height="176"
          placeholder
          class="rounded-lg"
        />
      </div>

      <div class="mt-4 text-center text-4xl font-medium">
        {{ game.name }}
      </div>

      <div class="mt-2 text-center">
        <UBadge
          v-for="platform in game.platforms"
          :key="platform.platformId"
          color="gray"
          variant="solid"
          size="md"
          class="me-1 align-middle"
          >{{ platform.platformId.toUpperCase() }}</UBadge
        >
      </div>

      <UHorizontalNavigation v-if="game" :links="links" class="mt-12" />

      <UPageCard>
        <NuxtPage />
      </UPageCard>
    </UPageBody>
  </UPage>
</template>
