<script setup lang="ts">
useSeoMeta({
  title: "Games",
});

const route = useRoute();
const page = ref(Number(route.query.page) ? Number(route.query.page) : 1);
const pageSize = 100;

const orderOptions = [
  {
    name: "Order by value",
    value: "value",
  },
  {
    name: "Order by average progress",
    value: "avgProgress",
  },
  {
    name: "Order by times completed",
    value: "timesCompleted",
  },
  {
    name: "Order by times started",
    value: "timesStarted",
  },
  {
    name: "Order by quality",
    value: "quality",
  },
  {
    name: "Order by last trophy",
    value: "lastTrophyEarnedAt",
  },
  {
    name: "Order by first trophy",
    value: "firstTrophyEarnedAt",
  },
];

const directionOptions = [
  {
    name: "Descending",
    value: "desc",
  },
  {
    name: "Ascending",
    value: "asc",
  },
];

const orderBy = ref("value");
const direction = ref("desc");

const { data: games } = await useFetch(`/api/public/v1/stacks`, {
  query: { orderBy, direction, page, pageSize },
  transform: (games) => {
    return {
      data: games.data.map((game) => ({
        stackId: game.id,
        gameId: game.gameId,
        name: game.game.name,
        platforms: game.game.platforms,
        definedPlatinum: game.definedPlatinum,
        definedGold: game.definedGold,
        definedSilver: game.definedSilver,
        definedBronze: game.definedBronze,
        firstTrophyEarnedAt: game.firstTrophyEarnedAt,
        lastTrophyEarnedAt: game.lastTrophyEarnedAt,
        quality: game.quality,
        timesStarted: game.timesStarted,
        timesCompleted: game.timesCompleted,
        progress: game.avgProgress,
        value: game.value,
      })),
      page: games.page,
      pageSize: games.pageSize,
      totalSize: games.totalSize,
    };
  },
});
</script>

<template>
  <UPage>
    <UPageBody>
      <UPageCard>
        <div id="top">
          <div class="mb-6 grid grid-cols-2 gap-6">
            <USelect
              v-model="orderBy"
              :options="orderOptions"
              option-attribute="name"
            >
              <template #trailing>
                <UIcon
                  name="i-heroicons-arrows-up-down-20-solid"
                  class="h-5 w-5"
                />
              </template>
            </USelect>

            <USelect
              v-model="direction"
              :options="directionOptions"
              option-attribute="name"
            >
              <template #trailing>
                <UIcon
                  name="i-heroicons-arrows-up-down-20-solid"
                  class="h-5 w-5"
                />
              </template>
            </USelect>
          </div>

          <div
            v-for="game in games?.data"
            :key="game.stackId"
            class="mb-3 last:mb-0"
          >
            <GamesGameOverview :game />
          </div>

          <div
            v-if="games && games.totalSize > games.pageSize"
            class="mt-6 flex justify-center"
          >
            <UPagination
              v-model="page"
              :page-count="games.pageSize"
              :total="games.totalSize"
              :to="
                (page: number) => ({
                  query: { page },
                  hash: '#top',
                })
              "
              show-first
              show-last
            />
          </div>
        </div>
      </UPageCard>
    </UPageBody>
  </UPage>
</template>
