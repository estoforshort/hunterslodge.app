<script setup lang="ts">
import formatThousands from "format-thousands";

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
        admin: profile.data.user.isAdmin,
        founder: profile.data.user.isFounder,
        region: {
          name: profile.data.region.name,
        },
        startedProjects: profile.data.startedProjects,
        completedProjects: profile.data.completedProjects,
        completion: profile.data.completion,
        streamPoints: profile.data.streamPoints,
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
      label: "Summary",
      icon: "i-bi-grid",
      to: `/hunters/${profile.value?.id}`,
      exact: true,
    },
    {
      label: "Projects",
      icon: "i-bi-joystick",
      to: `/hunters/${profile.value?.id}/projects`,
      active:
        route.name === "hunters-hunter-projects"
          ? true
          : route.name === "hunters-hunter-projects-project"
            ? true
            : route.name === "hunters-hunter-projects-project-group"
              ? true
              : false,
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

          <div class="mt-2 flex justify-center gap-2">
            <UBadge
              v-if="profile.admin"
              size="md"
              color="gray"
              variant="solid"
              label="Admin"
            />

            <UBadge
              v-if="profile.founder"
              size="md"
              color="gray"
              variant="solid"
              label="Founder"
            />

            <UBadge
              v-if="Number(profile.streamPoints) > 0"
              size="md"
              color="gray"
              variant="solid"
              label="Streamer"
            />
          </div>
        </div>
      </div>

      <UHorizontalNavigation v-if="profile" :links="links" class="mt-12" />

      <UPageCard>
        <NuxtPage />
      </UPageCard>
    </UPageBody>
  </UPage>
</template>
