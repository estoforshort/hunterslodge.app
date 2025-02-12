<script setup lang="ts">
import formatThousands from "format-thousands";

const route = useRoute();

const { data: hunter } = await useFetch(
  `/api/hunters/${route.params.hunter}/summary`,
  {
    transform: (hunter) => {
      if (!hunter.data) {
        return null;
      }

      return {
        id: hunter.data.userId,
        username: hunter.data.user?.username,
        displayName: hunter.data.user?.displayName,
        admin: hunter.data.user?.isAdmin,
        founder: hunter.data.user?.isFounder,
        region: {
          name: hunter.data.region.name,
        },
        startedProjects: hunter.data.startedProjects,
        completedProjects: hunter.data.completedProjects,
        completion: hunter.data.completion,
        streamPoints: hunter.data.streamPoints,
        streamPosition: hunter.data.streamPosition,
        regionalPosition: hunter.data.regionalPosition,
        globalPosition: hunter.data.globalPosition,
      };
    },
  },
);

useSeoMeta({
  title: hunter.value?.displayName,
});

const links = computed(() => [
  [
    {
      label: "Summary",
      icon: "i-bi-grid",
      to: `/hunters/${hunter.value?.username}`,
      exact: true,
    },
    {
      label: "Projects",
      icon: "i-bi-joystick",
      to: `/hunters/${hunter.value?.username}/projects`,
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
      to: `/hunters/${hunter.value?.username}/updates`,
    },
  ],
]);
</script>

<template>
  <UPage>
    <UPageBody>
      <div
        v-if="hunter"
        class="mt-24 rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-800 dark:bg-gray-900"
      >
        <div class="grid grid-cols-1 md:grid-cols-3">
          <div
            class="order-last mt-6 grid grid-cols-3 text-center md:order-first md:mt-0"
          >
            <div>
              <p class="text-lg font-bold">
                {{ formatThousands(hunter.startedProjects, ",") }}
              </p>
              <p class="text-gray-400 dark:text-gray-500">Projects</p>
            </div>

            <div>
              <p class="text-lg font-bold">
                {{ formatThousands(hunter.completedProjects, ",") }}
              </p>
              <p class="text-gray-400 dark:text-gray-500">Completions</p>
            </div>

            <div>
              <p class="text-lg font-bold">{{ hunter.completion }}%</p>
              <p class="text-gray-400 dark:text-gray-500">Completion</p>
            </div>
          </div>

          <div class="relative">
            <div
              class="absolute inset-x-0 top-0 mx-auto -mt-24 flex h-48 w-48 items-center justify-center rounded-full shadow-2xl"
            >
              <img :src="`/images/users/${hunter.id}`" class="rounded-full" />
            </div>
          </div>

          <div class="mt-32 grid grid-cols-3 space-x-6 text-center lg:mt-0">
            <div v-if="hunter.streamPosition">
              <p class="text-lg font-bold">
                {{ ordinal(hunter.streamPosition) }}
              </p>
              <p class="text-gray-400 dark:text-gray-500">Streamer</p>
            </div>

            <div v-else></div>

            <div v-if="hunter.regionalPosition">
              <p class="text-lg font-bold">
                {{ ordinal(hunter.regionalPosition) }}
              </p>
              <p class="text-gray-400 dark:text-gray-500">
                {{ hunter.region.name }}
              </p>
            </div>

            <div v-else></div>

            <div v-if="hunter.globalPosition">
              <p class="text-lg font-bold">
                {{ ordinal(hunter.globalPosition) }}
              </p>
              <p class="text-gray-400 dark:text-gray-500">Global</p>
            </div>

            <div v-else></div>
          </div>
        </div>

        <div class="mt-20 pb-6 text-center">
          <h1 class="text-4xl font-medium">
            {{ hunter.displayName }}
          </h1>

          <p class="mt-4">
            <NuxtLink
              :to="`https://twitch.tv/${hunter.username}`"
              target="_blank"
            >
              twitch.tv/{{ hunter.username }}
            </NuxtLink>
          </p>

          <div class="mt-2 flex justify-center gap-2">
            <UBadge
              v-if="hunter.admin"
              size="md"
              color="gray"
              variant="solid"
              label="Admin"
            />

            <UBadge
              v-if="hunter.founder"
              size="md"
              color="gray"
              variant="solid"
              label="Founder"
            />

            <UBadge
              v-if="Number(hunter.streamPoints) > 0"
              size="md"
              color="gray"
              variant="solid"
              label="Streamer"
            />
          </div>
        </div>
      </div>

      <UHorizontalNavigation v-if="hunter" :links="links" class="mt-12" />

      <UPageCard>
        <NuxtPage />
      </UPageCard>
    </UPageBody>
  </UPage>
</template>
