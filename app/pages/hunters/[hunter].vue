<script setup lang="ts">
import relativeTime from "dayjs/plugin/relativeTime";
import formatThousands from "format-thousands";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";

dayjs.extend(relativeTime);
dayjs.extend(duration);

const route = useRoute();

const { data: profile } = await useFetch(
  `/api/public/v1/profiles/${route.params.hunter}`,
  {
    transform: (profile) => {
      if (!profile.data) {
        return null;
      }

      return {
        id: profile.data.id,
        userId: profile.data.user.id,
        username: profile.data.user.username,
        displayName: profile.data.user.displayName,
        region: {
          name: profile.data.region.name,
        },
        startedProjects: profile.data.startedProjects,
        completedProjects: profile.data.completedProjects,
        earnedPlatinum: profile.data.earnedPlatinum,
        earnedGold: profile.data.earnedGold,
        earnedSilver: profile.data.earnedSilver,
        earnedBronze: profile.data.earnedBronze,
        completion: profile.data.completion,
        points: profile.data.points,
        streamPosition: profile.data.streamPosition,
        regionalPosition: profile.data.regionalPosition,
        globalPosition: profile.data.globalPosition,
      };
    },
  },
);

useSeoMeta({
  title: profile.value?.displayName,
});

const links = computed(() => [
  [
    {
      label: "Overview",
      icon: "i-bi-list",
      to: `/hunters/${profile.value?.id}`,
      exact: true,
    },
    {
      label: "Projects",
      icon: "i-bi-joystick",
      to: `/hunters/${profile.value?.id}/projects`,
    },
  ],
  [
    {
      label: "Updates",
      icon: "i-heroicons-arrow-path",
      to: `/hunters/${profile.value?.id}/updates`,
    },
  ],
]);
</script>

<template>
  <UPage>
    <UPageBody>
      <div
        v-if="profile"
        class="mt-24 rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-800 dark:bg-gray-900"
      >
        <div class="grid grid-cols-1 md:grid-cols-3">
          <div
            class="order-last mt-6 grid grid-cols-3 text-center md:order-first md:mt-0"
          >
            <div>
              <p class="text-lg font-bold">
                {{ formatThousands(profile.startedProjects, ",") }}
              </p>
              <p class="text-gray-400 dark:text-gray-500">Projects</p>
            </div>

            <div>
              <p class="text-lg font-bold">
                {{ formatThousands(profile.completedProjects, ",") }}
              </p>
              <p class="text-gray-400 dark:text-gray-500">Completions</p>
            </div>

            <div>
              <p class="text-lg font-bold">{{ profile.completion }}%</p>
              <p class="text-gray-400 dark:text-gray-500">Completion</p>
            </div>
          </div>

          <div class="relative">
            <div
              class="absolute inset-x-0 top-0 mx-auto -mt-24 flex h-48 w-48 items-center justify-center rounded-full shadow-2xl"
            >
              <img
                :src="`/images/users/${profile.userId}`"
                class="rounded-full"
              />
            </div>
          </div>

          <div class="mt-32 grid grid-cols-3 space-x-6 text-center lg:mt-0">
            <div v-if="profile.streamPosition">
              <p class="text-lg font-bold">
                {{ ordinal(profile.streamPosition) }}
              </p>
              <p class="text-gray-400 dark:text-gray-500">Streamer</p>
            </div>

            <div v-else></div>

            <div v-if="profile.regionalPosition">
              <p class="text-lg font-bold">
                {{ ordinal(profile.regionalPosition) }}
              </p>
              <p class="text-gray-400 dark:text-gray-500">
                {{ profile.region.name }}
              </p>
            </div>

            <div v-else></div>

            <div v-if="profile.globalPosition">
              <p class="text-lg font-bold">
                {{ ordinal(profile.globalPosition) }}
              </p>
              <p class="text-gray-400 dark:text-gray-500">Global</p>
            </div>

            <div v-else></div>
          </div>
        </div>

        <div class="mt-20 pb-6 text-center">
          <h1 class="text-4xl font-medium">
            {{ profile.displayName }}
          </h1>

          <p class="mt-4">
            <NuxtLink
              :to="`https://twitch.tv/${profile.username}`"
              target="_blank"
            >
              twitch.tv/{{ profile.username }}
            </NuxtLink>
          </p>

          <div class="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
            <UCard>
              <p class="text-lg font-bold text-sky-500 dark:text-sky-300">
                {{ formatThousands(profile.earnedPlatinum, ",") }}
              </p>
              <p class="text-gray-400 dark:text-gray-500">Platinum</p>
            </UCard>

            <UCard>
              <p class="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {{ formatThousands(profile.earnedGold, ",") }}
              </p>
              <p class="text-gray-400 dark:text-gray-500">Gold</p>
            </UCard>

            <UCard>
              <p class="text-lg font-bold text-gray-500 dark:text-gray-300">
                {{ formatThousands(profile.earnedSilver, ",") }}
              </p>
              <p class="text-gray-400 dark:text-gray-500">Silver</p>
            </UCard>

            <UCard>
              <p class="text-lg font-bold text-orange-600 dark:text-orange-500">
                {{ formatThousands(profile.earnedBronze, ",") }}
              </p>
              <p class="text-gray-400 dark:text-gray-500">Bronze</p>
            </UCard>
          </div>
        </div>

        <div class="flex flex-col justify-center">
          <UCard
            :ui="{ body: { padding: '!p-0' } }"
            class="relative overflow-hidden"
          >
            <div class="absolute p-6">
              <p class="text-gray-400 dark:text-gray-500">Points</p>
              <p class="text-lg font-bold">
                {{ formatThousands(profile.points, ",") }}
              </p>
            </div>

            <HuntersHunterPointsChart :profile="profile.id" />
          </UCard>
        </div>
      </div>

      <UHorizontalNavigation v-if="profile" :links="links" class="mt-12" />

      <UCard>
        <NuxtPage />
      </UCard>
    </UPageBody>
  </UPage>
</template>
