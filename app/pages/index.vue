<script setup lang="ts">
import formatThousands from "format-thousands";

useSeoMeta({
  title: "Hunters",
});

const { data: hunters } = await useFetch("/api/public/v1/profiles", {
  transform: (hunters) => {
    return hunters.data.map((hunter) => ({
      globalPosition: hunter.globalPosition,
      username: hunter.user.username,
      displayName: hunter.user.displayName,
      earnedPlatinum: hunter.earnedPlatinum,
      earnedGold: hunter.earnedGold,
      earnedSilver: hunter.earnedSilver,
      earnedBronze: hunter.earnedBronze,
      completion: `${hunter.completion}%`,
      points: formatThousands(hunter.points, ","),
    }));
  },
});

const columns = [
  {
    key: "globalPosition",
    label: "#",
  },
  {
    key: "displayName",
    label: "Hunter",
  },
  {
    key: "earnedPlatinum",
    label: "Platinum",
  },
  {
    key: "earnedGold",
    label: "Gold",
  },
  {
    key: "earnedSilver",
    label: "Silver",
  },
  {
    key: "earnedBronze",
    label: "Bronze",
  },
  {
    key: "completion",
    label: "Completion",
  },
  {
    key: "points",
    label: "Points",
  },
];
</script>

<template>
  <UPage>
    <UPageBody>
      <UCard :ui="{ body: { padding: '!p-0' } }">
        <UTable v-if="hunters" :columns="columns" :rows="hunters">
          <template #globalPosition-data="{ row }">
            <span v-if="row.globalPosition">
              {{ ordinal(row.globalPosition) }}
            </span>
          </template>

          <template #displayName-data="{ row }">
            <NuxtLink :to="`/${row.username}`">
              {{ row.displayName }}
            </NuxtLink>
          </template>

          <template #earnedPlatinum-data="{ row }">
            <span class="text-sky-500 dark:text-sky-300">
              {{ formatThousands(row.earnedPlatinum, ",") }}
            </span>
          </template>

          <template #earnedGold-data="{ row }">
            <span class="text-yellow-600 dark:text-yellow-400">
              {{ formatThousands(row.earnedGold, ",") }}
            </span>
          </template>

          <template #earnedSilver-data="{ row }">
            <span class="text-gray-500 dark:text-gray-300">
              {{ formatThousands(row.earnedSilver, ",") }}
            </span>
          </template>

          <template #earnedBronze-data="{ row }">
            <span class="text-orange-600 dark:text-orange-500">
              {{ formatThousands(row.earnedBronze, ",") }}
            </span>
          </template>
        </UTable>
      </UCard>
    </UPageBody>
  </UPage>
</template>
