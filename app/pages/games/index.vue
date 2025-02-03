<script setup lang="ts">
import formatThousands from "format-thousands";
import Fuse from "fuse.js";

useSeoMeta({
  title: "Games",
});

const platformOptions = [
  {
    name: "All platforms",
    value: "all",
  },
  {
    name: "PS5",
    value: "ps5",
  },
  {
    name: "PS4",
    value: "ps4",
  },
  {
    name: "Vita",
    value: "psvita",
  },
  {
    name: "PS3",
    value: "ps3",
  },
  {
    name: "PC",
    value: "pspc",
  },
];

const orderOptions = [
  {
    name: "Order by value",
    value: "value",
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

const route = useRoute();

const page = ref(Number(route.query.page) ? Number(route.query.page) : 1);
const pageSize = 50;

const platform = ref("all");
const orderBy = ref("value");
const direction = ref("desc");

const { data: games } = await useFetch(`/api/games`, {
  query: { platform, orderBy, direction, page, pageSize },
  transform: (games) => {
    return {
      data: games.data.map((game) => ({
        id: game.id,
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
        value: formatThousands(game.value, ","),
      })),
      page: games.page,
      pageSize: games.pageSize,
      totalSize: games.totalSize,
    };
  },
});

const searchResults = ref<
  {
    id: string;
    name: string;
    platforms: {
      platformId: string;
    }[];
    definedPlatinum: number;
    definedGold: number;
    definedSilver: number;
    definedBronze: number;
    firstTrophyEarnedAt: string | null;
    lastTrophyEarnedAt: string | null;
    quality: string;
    timesStarted: number;
    timesCompleted: number;
    progress: number;
    value: string;
  }[]
>([]);

const searching = ref(false);
const name = ref("");

async function search() {
  try {
    if (!searching.value && name.value.length) {
      searching.value = true;

      const response = await $fetch("/api/games/search", {
        method: "POST",
        body: { name: name.value },
      });

      const fuse = new Fuse(response.data, {
        findAllMatches: true,
        keys: ["game.name"],
        threshold: 0.2,
      });

      const results = fuse.search(name.value);

      searchResults.value = [];

      if (results.length) {
        for (let r = 0, rc = results.length; r < rc; r++) {
          const result = results[r]?.item;

          if (result) {
            searchResults.value.push({
              id: result.id,
              name: result.game.name,
              platforms: result.game.platforms,
              definedPlatinum: result.definedPlatinum,
              definedGold: result.definedGold,
              definedSilver: result.definedSilver,
              definedBronze: result.definedBronze,
              firstTrophyEarnedAt: result.firstTrophyEarnedAt,
              lastTrophyEarnedAt: result.lastTrophyEarnedAt,
              quality: result.quality,
              timesStarted: result.timesStarted,
              timesCompleted: result.timesCompleted,
              progress: result.avgProgress,
              value: formatThousands(result.value, ","),
            });
          }
        }
      }

      searching.value = false;
      console.log(searchResults.value);
    }
  } catch (e) {
    console.error(e);
    searching.value = false;
  }
}

watch(name, (newName) => {
  if (newName.trim().length) {
    search();
  } else {
    searchResults.value = [];
  }
});
</script>

<template>
  <UPage>
    <UPageBody>
      <UPageCard>
        <div id="top">
          <UInput v-model="name" placeholder="Search..." class="mb-3" />
          <div class="mb-6 grid grid-cols-3 gap-3">
            <USelect
              v-model="platform"
              :options="platformOptions"
              option-attribute="name"
              :disabled="name.trim().length > 0"
            >
              <template #trailing>
                <UIcon
                  name="i-heroicons-arrows-up-down-20-solid"
                  class="h-5 w-5"
                />
              </template>
            </USelect>

            <USelect
              v-model="orderBy"
              :options="orderOptions"
              option-attribute="name"
              :disabled="name.trim().length > 0"
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
              :disabled="name.trim().length > 0"
            >
              <template #trailing>
                <UIcon
                  name="i-heroicons-arrows-up-down-20-solid"
                  class="h-5 w-5"
                />
              </template>
            </USelect>
          </div>

          <div v-if="name.trim().length">
            <div
              v-for="game in searchResults"
              :key="game.id"
              class="mb-3 last:mb-0"
            >
              <GamesGameOverview :order-by="'value'" :game />
            </div>
          </div>

          <div v-else>
            <div
              v-for="game in games?.data"
              :key="game.id"
              class="mb-3 last:mb-0"
            >
              <GamesGameOverview :order-by="orderBy" :game />
            </div>
          </div>

          <div
            v-if="
              name.trim().length === 0 &&
              games &&
              games.totalSize > games.pageSize
            "
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
