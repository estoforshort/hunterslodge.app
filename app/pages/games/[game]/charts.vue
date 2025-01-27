<script setup lang="ts">
const route = useRoute();

const changes = ref<
  {
    trophies: number;
    quality: string;
    timesStarted: number;
    timesCompleted: number;
    avgProgress: number;
    value: string;
    createdAt: string;
  }[]
>([]);

const { data: firstSet } = await useFetch(
  `/api/games/${route.params.game}/changes`,
  {
    transform: (changes) => {
      return {
        data: changes.data.map((change) => ({
          trophies:
            change.definedPlatinumTo +
            change.definedGoldTo +
            change.definedSilverTo +
            change.definedBronzeTo,
          quality: change.qualityTo,
          timesStarted: change.timesStartedTo,
          timesCompleted: change.timesCompletedTo,
          avgProgress: change.avgProgressTo,
          value: change.valueTo,
          createdAt: change.createdAt,
        })),
        page: changes.page,
        pageSize: changes.pageSize,
        totalSize: changes.totalSize,
      };
    },
  },
);

if (firstSet.value?.pageSize) {
  changes.value = firstSet.value.data;

  const changesLeft = firstSet.value.totalSize - 100;

  if (changesLeft > 0) {
    const callsToDo = Math.ceil(changesLeft / 100);

    let page = 2;

    for (let c = 0, ctd = callsToDo; c < ctd; c++) {
      const moreChanges = await $fetch(
        `/api/games/${route.params.game}/changes?page=${page}`,
      );

      for (let i = 0, il = moreChanges.data.length; i < il; i++) {
        changes.value.push({
          trophies:
            moreChanges.data[i]!.definedPlatinumTo +
            moreChanges.data[i]!.definedGoldTo +
            moreChanges.data[i]!.definedSilverTo +
            moreChanges.data[i]!.definedBronzeTo,
          quality: moreChanges.data[i]!.qualityTo,
          timesStarted: moreChanges.data[i]!.timesStartedTo,
          timesCompleted: moreChanges.data[i]!.timesCompletedTo,
          avgProgress: moreChanges.data[i]!.avgProgressTo,
          value: moreChanges.data[i]!.valueTo,
          createdAt: moreChanges.data[i]!.createdAt,
        });
      }

      page++;
    }
  }
}
</script>

<template>
  <div v-if="changes">
    <UCard>
      <span class="text-xl font-medium">Number of trophies</span>
      <GamesGameChartsTrophiesChart :changes class="mt-6" />
    </UCard>

    <UCard class="mt-8">
      <span class="text-xl font-medium">Quality</span>
      <GamesGameChartsQualityChart :changes class="mt-6" />
    </UCard>

    <UCard class="mt-8">
      <span class="text-xl font-medium">Times started</span>
      <GamesGameChartsTimesStartedChart :changes class="mt-6" />
    </UCard>

    <UCard class="mt-8">
      <span class="text-xl font-medium">Times completed</span>
      <GamesGameChartsTimesCompletedChart :changes class="mt-6" />
    </UCard>

    <UCard class="mt-8">
      <span class="text-xl font-medium">Average progress</span>
      <GamesGameChartsAvgProgressChart :changes class="mt-6" />
    </UCard>

    <UCard class="mt-8">
      <span class="text-xl font-medium">Value</span>
      <GamesGameChartsValueChart :changes class="mt-6" />
    </UCard>
  </div>
</template>
