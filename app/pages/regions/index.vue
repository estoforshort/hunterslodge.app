<script setup lang="ts">
import formatThousands from "format-thousands";

useSeoMeta({
  title: "Regions",
});

const { data: regions } = await useFetch("/api/profile-regions", {
  transform: (regions) => {
    return {
      data: regions.data.map((region) => ({
        id: region.id,
        name: region.name,
        earnedPlatinum: region.earnedPlatinum,
        earnedGold: region.earnedGold,
        earnedSilver: region.earnedSilver,
        earnedBronze: region.earnedBronze,
        points: formatThousands(region.points, ","),
        position: region.position,
      })),
    };
  },
});

const columns = [
  {
    key: "position",
    label: "#",
  },
  {
    key: "name",
    label: "Region",
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
    key: "points",
    label: "Points",
  },
];
</script>

<template>
  <UPage>
    <UPageBody>
      <UCard :ui="{ body: { padding: '!p-0' } }">
        <UTable v-if="regions?.data" :columns="columns" :rows="regions.data">
          <template #position-data="{ row }">
            <span v-if="row.position">
              {{ ordinal(row.position) }}
            </span>
          </template>

          <template #name-data="{ row }">
            <div class="flex items-center gap-3">
              <UIcon :name="`i-circle-flags-${row.id}`" class="h-6 w-6" />
              <NuxtLink :to="`/regions/${row.id}`" class="font-semibold">
                {{ row.name }}
              </NuxtLink>
            </div>
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
