<script setup lang="ts">
const route = useRoute();

const { data: groups } = await useFetch(
  `/api/hunters/${route.params.hunter}/projects/${route.params.project}/groups`,
  {
    transform: (groups) => {
      return {
        data: groups.data.map((group) => ({
          stackId: group.stackGroup.stackId,
          gameId: group.stackGroup.gameId,
          groupId: group.stackGroup.groupId,
          name: group.stackGroup.gameGroup.name,
          definedPlatinum: group.stackGroup.definedPlatinum,
          definedGold: group.stackGroup.definedGold,
          definedSilver: group.stackGroup.definedSilver,
          definedBronze: group.stackGroup.definedBronze,
          earnedPlatinum: group.earnedPlatinum,
          earnedGold: group.earnedGold,
          earnedSilver: group.earnedSilver,
          earnedBronze: group.earnedBronze,
          streamPlatinum: group.streamPlatinum,
          streamGold: group.streamGold,
          streamSilver: group.streamSilver,
          streamBronze: group.streamBronze,
          firstTrophyEarnedAt: group.firstTrophyEarnedAt,
          lastTrophyEarnedAt: group.lastTrophyEarnedAt,
          quality: group.stackGroup.quality,
          timesCompleted: group.stackGroup.timesCompleted,
          value: group.stackGroup.value,
          progress: group.progress,
          points: group.points,
          streamPoints: group.streamPoints,
        })),
      };
    },
  },
);

if (groups.value && groups.value.data.length === 1) {
  await navigateTo(
    `/hunters/${route.params.hunter}/projects/${route.params.project}/${groups.value.data[0]?.groupId}`,
  );
}

const { data: project } = await useFetch(
  `/api/hunters/${route.params.hunter}/projects/${route.params.project}/summary`,
);

const breadcrumb = computed(() => [
  {
    label: "Projects",
    to: `/hunters/${route.params.hunter}/projects`,
  },
  {
    label: project.value?.data?.stack.game.name ?? "",
  },
]);
</script>

<template>
  <div>
    <UBreadcrumb :links="breadcrumb" class="mb-6" />

    <div
      v-for="group in groups?.data"
      :key="group.groupId"
      class="mb-3 last:mb-0"
    >
      <HuntersHunterProjectGroupOverview :group />
    </div>
  </div>
</template>
