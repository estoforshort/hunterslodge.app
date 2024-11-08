<script setup lang="ts">
import formatThousands from "format-thousands";

useSeoMeta({
  title: "Leaderboard",
});

const { data: profiles } = await useFetch("/api/public/v1/profiles");

const columns = [
  {
    key: "globalPosition",
    label: "#",
  },
  {
    key: "user.displayName",
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
      <UCard>
        <UTable v-if="profiles" :columns="columns" :rows="profiles.data">
          <template #earnedPlatinum-data="{ row }">
            <span class="text-sky-500 dark:text-sky-300">{{
              formatThousands(row.earnedPlatinum, ",")
            }}</span>
          </template>

          <template #earnedGold-data="{ row }">
            <span class="text-yellow-600 dark:text-yellow-400">{{
              formatThousands(row.earnedGold, ",")
            }}</span>
          </template>

          <template #earnedSilver-data="{ row }">
            <span class="text-gray-500 dark:text-gray-300">{{
              formatThousands(row.earnedSilver, ",")
            }}</span>
          </template>

          <template #earnedBronze-data="{ row }">
            <span class="text-orange-600 dark:text-orange-500">{{
              formatThousands(row.earnedBronze, ",")
            }}</span>
          </template>

          <template #completion-data="{ row }">
            {{ row.completion }}%
          </template>

          <template #points-data="{ row }">
            {{ formatThousands(row.points, ",") }}
          </template>
        </UTable>
      </UCard>
    </UPageBody>
  </UPage>
</template>
