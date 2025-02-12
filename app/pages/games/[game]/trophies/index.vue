<script setup lang="ts">
import formatThousands from "format-thousands";

const route = useRoute();

const { data: groups } = await useFetch(
  `/api/games/${route.params.game}/groups`,
  {
    transform: (groups) => {
      return {
        data: groups.data.map((group) => ({
          gameId: group.gameId,
          groupId: group.groupId,
          name: group.gameGroup.name,
          definedPlatinum: group.definedPlatinum,
          definedGold: group.definedGold,
          definedSilver: group.definedSilver,
          definedBronze: group.definedBronze,
          firstTrophyEarnedAt: group.firstTrophyEarnedAt,
          lastTrophyEarnedAt: group.lastTrophyEarnedAt,
          quality: group.quality,
          timesCompleted: group.timesCompleted,
          progress: group.avgProgress,
          value: formatThousands(group.value, ","),
        })),
      };
    },
  },
);

if (groups.value && groups.value.data.length === 1) {
  await navigateTo(
    `/games/${route.params.game}/trophies/${groups.value.data[0]?.groupId}`,
  );
}
</script>

<template>
  <div>
    <div
      v-for="group in groups?.data"
      :key="group.groupId"
      class="mb-3 last:mb-0"
    >
      <GamesGameGroupOverview :group />
    </div>
  </div>
</template>
