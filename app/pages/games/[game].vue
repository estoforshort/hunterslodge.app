<script setup lang="ts">
const route = useRoute();

const { data: game } = await useFetch(
  `/api/games/${route.params.game}/summary`,
  {
    transform: (game) => {
      if (!game.data) {
        return null;
      }

      return {
        id: game.data.id,
        gameId: game.data.gameId,
        name: game.data.game.name,
        platforms: game.data.game.platforms,
        definedPlatinum: game.data.definedPlatinum,
        definedGold: game.data.definedGold,
        definedSilver: game.data.definedSilver,
        definedBronze: game.data.definedBronze,
      };
    },
  },
);

useSeoMeta({
  title: game.value?.name,
});

const links = computed(() => [
  [],
  [
    {
      label: "Summary",
      icon: "i-bi-grid",
      to: `/games/${game.value?.id}`,
      exact: true,
    },
    {
      label: "Trophies",
      icon: "i-bi-trophy",
      to: `/games/${game.value?.id}/trophies`,
      active:
        route.name === "games-game-trophies"
          ? true
          : route.name === "games-game-trophies-group"
            ? true
            : false,
    },
  ],
  [],
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

      <div class="my-4 text-center text-2xl font-medium">
        <span
          v-if="game.definedPlatinum"
          class="me-8 text-sky-500 dark:text-sky-300"
        >
          <span class="align-middle">
            <UIcon name="i-bi-trophy" class="me-2 align-middle" />
            <span class="align-middle">
              {{ game.definedPlatinum }}
            </span>
          </span>
        </span>

        <span
          v-if="game.definedGold"
          class="me-8 text-yellow-600 dark:text-yellow-400"
        >
          <span class="align-middle">
            <UIcon name="i-bi-trophy" class="me-2 align-middle" />
            <span class="align-middle">
              {{ game.definedGold }}
            </span>
          </span>
        </span>

        <span
          v-if="game.definedSilver"
          class="me-8 text-gray-500 dark:text-gray-300"
        >
          <span class="align-middle">
            <UIcon name="i-bi-trophy" class="me-2 align-middle" />
            <span class="align-middle">
              {{ game.definedSilver }}
            </span>
          </span>
        </span>

        <span
          v-if="game.definedBronze"
          class="text-orange-600 dark:text-orange-500"
        >
          <span class="align-middle">
            <UIcon name="i-bi-trophy" class="me-2 align-middle" />
            <span class="align-middle">
              {{ game.definedBronze }}
            </span>
          </span>
        </span>
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
