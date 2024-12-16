<script setup lang="ts">
import formatThousands from "format-thousands";

useSeoMeta({
  title: "Hunters",
});

const { data: hunters } = await useFetch("/api/public/v1/profiles", {
  transform: (hunters) => {
    return hunters.data.map((hunter) => ({
      id: hunter.id,
      userId: hunter.user.id,
      displayName: hunter.user.displayName,
      admin: hunter.user.isAdmin,
      founder: hunter.user.isFounder,
      region: {
        id: hunter.region.id,
        name: hunter.region.name,
      },
      earnedPlatinum: hunter.earnedPlatinum,
      earnedGold: hunter.earnedGold,
      earnedSilver: hunter.earnedSilver,
      earnedBronze: hunter.earnedBronze,
      points: formatThousands(hunter.points, ","),
      streamPoints: hunter.streamPoints,
      globalPosition: hunter.globalPosition,
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
        <UTable v-if="hunters" :columns="columns" :rows="hunters">
          <template #globalPosition-data="{ row }">
            <span v-if="row.globalPosition">
              {{ ordinal(row.globalPosition) }}
            </span>
          </template>

          <template #displayName-data="{ row }">
            <div class="flex items-center gap-3">
              <div class="bg-cool-200 dark:bg-cool-800 rounded">
                <NuxtLink :to="`/hunters/${row.id}`">
                  <NuxtImg
                    :src="`${config.public.baseUrl}/images/users/${row.userId}`"
                    width="48"
                    class="max-h-12 min-h-12 min-w-12 max-w-12 rounded object-contain"
                    placeholder
                  />
                </NuxtLink>
              </div>

              <span>
                <span class="font-semibold">
                  <NuxtLink :to="`/hunters/${row.id}`">
                    {{ row.displayName }}
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
                    <UIcon
                      class="me-1"
                      :name="`i-circle-flags-${row.region.id}`"
                    />
                    {{ row.region.name }}
                  </UBadge>

                  <UBadge
                    v-if="row.admin"
                    color="gray"
                    variant="solid"
                    size="sm"
                    class="ms-1 align-middle"
                  >
                    Admin
                  </UBadge>

                  <UBadge
                    v-if="row.founder"
                    color="gray"
                    variant="solid"
                    size="sm"
                    class="ms-1 align-middle"
                  >
                    Founder
                  </UBadge>

                  <UBadge
                    v-if="Number(row.streamPoints) > 0"
                    color="gray"
                    variant="solid"
                    size="sm"
                    class="ms-1 align-middle"
                  >
                    Streamer
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
      </UCard>
    </UPageBody>
  </UPage>
</template>
