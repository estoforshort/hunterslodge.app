<script setup lang="ts">
import formatThousands from "format-thousands";

useSeoMeta({
  title: "Hunters",
});

const route = useRoute();
const page = ref(Number(route.query.page) ? Number(route.query.page) : 1);
const pageSize = 50;

const { data: hunters } = await useFetch("/api/profiles", {
  query: { page, pageSize },
  transform: (hunters) => {
    return {
      data: hunters.data.map((hunter) => ({
        userId: hunter.userId,
        regionId: hunter.regionId,
        earnedPlatinum: hunter.earnedPlatinum,
        earnedGold: hunter.earnedGold,
        earnedSilver: hunter.earnedSilver,
        earnedBronze: hunter.earnedBronze,
        points: formatThousands(hunter.points, ","),
        streamerPoints: Number(hunter.streamPoints),
        globalPosition: hunter.globalPosition,
      })),
      page: hunters.page,
      pageSize: hunters.pageSize,
      totalSize: hunters.totalSize,
    };
  },
});

const columns = [
  {
    key: "globalPosition",
    label: "#",
  },
  {
    key: "hunter",
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
    key: "points",
    label: "Points",
  },
];
</script>

<template>
  <UPage>
    <UPageBody>
      <UCard :ui="{ body: { padding: '!p-0' } }">
        <UTable v-if="hunters" :columns="columns" :rows="hunters.data">
          <template #globalPosition-data="{ row }">
            <span v-if="row.globalPosition">
              {{ ordinal(row.globalPosition) }}
            </span>
          </template>

          <template #hunter-data="{ row }">
            <CompactUserInfo
              :user-id="row.userId"
              :region-id="row.regionId"
              :streamer-points="row.streamerPoints"
            />
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

        <div
          v-if="hunters && hunters.totalSize > hunters.pageSize"
          class="flex justify-center border-t border-gray-200 px-3 py-3.5 dark:border-gray-700"
        >
          <UPagination
            v-model="page"
            :page-count="hunters.pageSize"
            :total="hunters.totalSize"
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
      </UCard>
    </UPageBody>
  </UPage>
</template>
