<script setup lang="ts">
const route = useRoute();
const page = ref(Number(route.query.page) ? Number(route.query.page) : 1);
const pageSize = 50;

const orderOptions = [
  {
    name: "Order by last trophy",
    value: "lastTrophyEarnedAt",
  },
  {
    name: "Order by first trophy",
    value: "firstTrophyEarnedAt",
  },
  {
    name: "Order by points",
    value: "points",
  },
  {
    name: "Order by stream points",
    value: "streamPoints",
  },
  {
    name: "Order by time streamed",
    value: "timeStreamed",
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

const orderBy = ref("lastTrophyEarnedAt");
const direction = ref("desc");

const { data: projects } = await useFetch(
  `/api/hunters/${route.params.hunter}/projects`,
  {
    query: { orderBy, direction, page, pageSize },
    transform: (projects) => {
      return {
        data: projects.data.map((project) => ({
          stackId: project.stack.id,
          name: project.stack.game.name,
          platforms: project.stack.game.platforms,
          definedPlatinum: project.stack.definedPlatinum,
          definedGold: project.stack.definedGold,
          definedSilver: project.stack.definedSilver,
          definedBronze: project.stack.definedBronze,
          earnedPlatinum: project.earnedPlatinum,
          earnedGold: project.earnedGold,
          earnedSilver: project.earnedSilver,
          earnedBronze: project.earnedBronze,
          streamPlatinum: project.streamPlatinum,
          streamGold: project.streamGold,
          streamSilver: project.streamSilver,
          streamBronze: project.streamBronze,
          firstTrophyEarnedAt: project.firstTrophyEarnedAt,
          lastTrophyEarnedAt: project.lastTrophyEarnedAt,
          quality: project.stack.quality,
          timesStarted: project.stack.timesStarted,
          timesCompleted: project.stack.timesCompleted,
          value: project.stack.value,
          progress: project.progress,
          points: project.points,
          streamPoints: project.streamPoints,
          timeStreamed: project.timeStreamed,
        })),
        page: projects.page,
        pageSize: projects.pageSize,
        totalSize: projects.totalSize,
      };
    },
  },
);
</script>

<template>
  <div id="top">
    <div class="mb-6 grid grid-cols-2 gap-6">
      <USelect
        v-model="orderBy"
        :options="orderOptions"
        option-attribute="name"
      >
        <template #trailing>
          <UIcon name="i-heroicons-arrows-up-down-20-solid" class="h-5 w-5" />
        </template>
      </USelect>

      <USelect
        v-model="direction"
        :options="directionOptions"
        option-attribute="name"
      >
        <template #trailing>
          <UIcon name="i-heroicons-arrows-up-down-20-solid" class="h-5 w-5" />
        </template>
      </USelect>
    </div>

    <div
      v-for="project in projects?.data"
      :key="project.stackId"
      class="mb-3 last:mb-0"
    >
      <HuntersHunterProjectOverview :order-by="orderBy" :project />
    </div>

    <div
      v-if="projects && projects.totalSize > projects.pageSize"
      class="mt-6 flex justify-center"
    >
      <UPagination
        v-model="page"
        :page-count="projects.pageSize"
        :total="projects.totalSize"
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
</template>
