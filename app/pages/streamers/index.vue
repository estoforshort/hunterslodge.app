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

const { data: streamers } = await useFetch("/api/hunters", {
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
        user: streamer.user,
        region: streamer.region,
        streamPlatinum: formatThousands(streamer.streamPlatinum, ","),
        streamGold: formatThousands(streamer.streamGold, ","),
        streamSilver: formatThousands(streamer.streamSilver, ","),
        streamBronze: formatThousands(streamer.streamBronze, ","),
        streamPoints: formatThousands(streamer.streamPoints, ","),
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

const config = useRuntimeConfig();
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
            {{ ordinal(row.streamPosition) }}
          </template>

          <template #streamer-data="{ row }">
            <div class="flex items-center gap-3">
              <UTooltip
                :text="
                  row.user.isAdmin
                    ? 'Administrator'
                    : row.user.isFounder
                      ? 'Founder'
                      : row.streamPosition > 0
                        ? 'Streamer'
                        : ''
                "
                :popper="{ arrow: true }"
              >
                <UChip
                  :color="
                    row.user.isAdmin
                      ? 'red'
                      : row.user.isFounder
                        ? 'yellow'
                        : row.streamPosition > 0
                          ? 'primary'
                          : 'gray'
                  "
                  position="top-left"
                  :text="
                    row.user.isAdmin
                      ? 'A'
                      : row.user.isFounder
                        ? 'F'
                        : row.streamPosition > 0
                          ? 'S'
                          : ''
                  "
                  size="xl"
                  :show="
                    row.user.isAdmin ||
                    row.user.isFounder ||
                    row.streamPosition > 0
                  "
                >
                  <div
                    class="bg-cool-200 dark:bg-cool-800 rounded"
                    :class="
                      row.user.isAdmin
                        ? 'border-2 border-red-500 dark:border-red-400'
                        : row.user.isFounder
                          ? 'border-2 border-yellow-500 dark:border-yellow-400'
                          : row.streamPosition > 0
                            ? 'border-primary dark:border-primary border-2'
                            : ''
                    "
                  >
                    <NuxtLink :to="`/hunters/${row.user.username}`">
                      <NuxtImg
                        :src="`${config.public.baseUrl}/api/hunters/${row.user.username}/images/twitch`"
                        width="48"
                        class="max-h-12 min-h-12 min-w-12 max-w-12 rounded object-contain"
                        placeholder
                      />
                    </NuxtLink>
                  </div>
                </UChip>
              </UTooltip>

              <span>
                <span class="font-semibold">
                  <NuxtLink :to="`/hunters/${row.user.username}`">
                    {{ row.user.displayName }}
                  </NuxtLink>
                </span>
                <br />
                <span>
                  <UBadge
                    color="gray"
                    variant="solid"
                    size="sm"
                    class="align-middle"
                  >
                    <UIcon :name="`i-circle-flags-${row.region.id}`" />
                    {{ row.region.name }}
                  </UBadge>
                </span>
              </span>
            </div>
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

          <template #live-data="{ row }">
            <StreamersLiveIndicator :username="row.user.username" />
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
