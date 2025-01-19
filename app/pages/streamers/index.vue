<script setup lang="ts">
import formatThousands from "format-thousands";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";

dayjs.extend(duration);

useSeoMeta({
  title: "Streamers",
});

const route = useRoute();
const page = ref(Number(route.query.page) ? Number(route.query.page) : 1);
const pageSize = 50;

const { data: streamers } = await useFetch("/api/profiles", {
  query: {
    page,
    pageSize,
    orderBy: "streamPosition",
    direction: "asc",
    onlyStreamers: true,
  },
  transform: (streamers) => {
    return {
      data: streamers.data.map((streamer) => ({
        id: streamer.id,
        userId: streamer.userId,
        regionId: streamer.regionId,
        streamPlatinum: formatThousands(streamer.streamPlatinum, ","),
        streamGold: formatThousands(streamer.streamGold, ","),
        streamSilver: formatThousands(streamer.streamSilver, ","),
        streamBronze: formatThousands(streamer.streamBronze, ","),
        streamPoints: Number(streamer.streamPoints),
        timeStreamed: formatThousands(
          Math.round(
            dayjs.duration(streamer.timeStreamed, "seconds").as("hours") * 10,
          ) / 10,
          ",",
        ),
        streamPosition: streamer.streamPosition,
      })),
      page: streamers.page,
      pageSize: streamers.pageSize,
      totalSize: streamers.totalSize,
    };
  },
});

const columns = [
  {
    key: "streamPosition",
    label: "#",
  },
  {
    key: "streamer",
    label: "Streamer",
  },
  {
    key: "streamPlatinum",
    label: "Platinum",
  },
  {
    key: "streamGold",
    label: "Gold",
  },
  {
    key: "streamSilver",
    label: "Silver",
  },
  {
    key: "streamBronze",
    label: "Bronze",
  },
  {
    key: "timeStreamed",
    label: "Hours",
  },
  {
    key: "streamPoints",
    label: "Points",
  },
  {
    key: "live",
    label: "Live",
  },
];
</script>

<template>
  <UPage>
    <UPageBody>
      <UCard :ui="{ body: { padding: '!p-0' } }">
        <UTable
          v-if="streamers?.data"
          :columns="columns"
          :rows="streamers.data"
        >
          <template #streamPosition-data="{ row }">
            <span v-if="row.streamPosition">
              {{ ordinal(row.streamPosition) }}
            </span>
          </template>

          <template #streamer-data="{ row }">
            <CompactUserInfo
              :user-id="row.userId"
              :region-id="row.regionId"
              :streamer-points="row.streamPoints"
            />
          </template>

          <template #streamPlatinum-data="{ row }">
            <span class="text-sky-500 dark:text-sky-300">
              {{ row.streamPlatinum }}
            </span>
          </template>

          <template #streamGold-data="{ row }">
            <span class="text-yellow-600 dark:text-yellow-400">
              {{ row.streamGold }}
            </span>
          </template>

          <template #streamSilver-data="{ row }">
            <span class="text-gray-500 dark:text-gray-300">
              {{ row.streamSilver }}
            </span>
          </template>

          <template #streamBronze-data="{ row }">
            <span class="text-orange-600 dark:text-orange-500">
              {{ row.streamBronze }}
            </span>
          </template>

          <template #timeStreamed-data="{ row }">
            {{ row.timeStreamed }}h
          </template>

          <template #streamPoints-data="{ row }">
            {{ formatThousands(row.streamPoints, ",") }}
          </template>

          <template #live-data="{ row }">
            <StreamersLiveIndicator :id="row.id" :user-id="row.userId" />
          </template>
        </UTable>

        <div
          v-if="streamers && streamers.totalSize > streamers.pageSize"
          class="flex justify-center border-t border-gray-200 px-3 py-3.5 dark:border-gray-700"
        >
          <UPagination
            v-model="page"
            :page-count="streamers.pageSize"
            :total="streamers.totalSize"
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
