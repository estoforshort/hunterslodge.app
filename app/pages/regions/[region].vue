<script setup lang="ts">
import formatThousands from "format-thousands";

const route = useRoute();

const { data: region } = await useFetch(
  `/api/regions/${route.params.region}/summary`,
  {
    transform: (region) => {
      if (!region.data) {
        return null;
      }

      return {
        name: region.data.name,
      };
    },
  },
);

useSeoMeta({
  title: region.value?.name,
});

const page = ref(Number(route.query.page) ? Number(route.query.page) : 1);
const pageSize = 50;

const { data: hunters } = await useFetch(
  `/api/regions/${route.params.region}/hunters`,
  {
    query: { page, pageSize },
    transform: (hunters) => {
      return {
        data: hunters.data.map((hunter) => ({
          user: hunter.user,
          region: hunter.region,
          earnedPlatinum: hunter.earnedPlatinum,
          earnedGold: hunter.earnedGold,
          earnedSilver: hunter.earnedSilver,
          earnedBronze: hunter.earnedBronze,
          points: formatThousands(hunter.points, ","),
          streamPosition: hunter.streamPosition,
          globalPosition: hunter.regionalPosition,
        })),
        page: hunters.page,
        pageSize: hunters.pageSize,
        totalSize: hunters.totalSize,
      };
    },
  },
);

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

const config = useRuntimeConfig();
</script>

<template>
  <UPage>
    <UPageBody>
      <UCard :ui="{ body: { padding: '!p-0' } }">
        <UTable v-if="hunters" :columns="columns" :rows="hunters.data">
          <template #globalPosition-data="{ row }">
            {{ ordinal(row.globalPosition) }}
          </template>

          <template #hunter-data="{ row }">
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
                        :src="`${config.public.baseUrl}/images/users/${row.user.id}`"
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
