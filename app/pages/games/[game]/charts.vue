<script setup lang="ts">
const route = useRoute();

const { data: changes } = await useFetch(
  `/api/public/v1/stacks/${route.params.game}/changes`,
  {
    transform: (changes) => {
      return changes.data.map((change) => ({
        trophies:
          change.definedPlatinumTo +
          change.definedGoldTo +
          change.definedSilverTo +
          change.definedBronzeTo,
        quality: change.qualityTo,
        timesStarted: change.timesStartedTo,
        rarity: change.rarityTo,
        timesCompleted: change.timesCompletedTo,
        avgProgress: change.avgProgressTo,
        value: change.valueTo,
        createdAt: change.createdAt,
      }));
    },
  },
);
</script>

<template>
  <div v-if="changes">
    <UCard>
      <span class="text-xl font-medium">Trophies</span>
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
      <span class="text-xl font-medium">Rarity</span>
      <GamesGameChartsRarityChart :changes class="mt-6" />
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
