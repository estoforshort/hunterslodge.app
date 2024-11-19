<script setup lang="ts">
import relativeTime from "dayjs/plugin/relativeTime";
import formatThousands from "format-thousands";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";

dayjs.extend(relativeTime);
dayjs.extend(duration);

definePageMeta({
  layout: "overlay",
});

useSeoMeta({
  title: "Overlay",
});

const route = useRoute();

const { data: overlay, refresh } = await useFetch(
  `/api/public/v1/overlay/${route.params.overlay}`,
  {
    transform: (overlay) => {
      if (!overlay.data) {
        return null;
      }

      return {
        profile: {
          onlineId: overlay.data.profile.onlineId,
          startedProjects: overlay.data.profile.startedProjects,
          completedProjects: overlay.data.profile.completedProjects,
          earnedPlatinum: overlay.data.profile.earnedPlatinum,
          earnedGold: overlay.data.profile.earnedGold,
          earnedSilver: overlay.data.profile.earnedSilver,
          earnedBronze: overlay.data.profile.earnedBronze,
          completion: overlay.data.profile.completion,
        },
        project: overlay.data.project
          ? {
              id: overlay.data.project.stack.game.id,
              definedTrophies:
                overlay.data.project.stack.definedPlatinum +
                overlay.data.project.stack.definedGold +
                overlay.data.project.stack.definedSilver +
                overlay.data.project.stack.definedBronze,
              earnedTrophies:
                overlay.data.project.earnedPlatinum +
                overlay.data.project.earnedGold +
                overlay.data.project.earnedSilver +
                overlay.data.project.earnedBronze,
              progress: overlay.data.project.progress,
              timeStreamed: overlay.data.project.timeStreamed,
            }
          : null,
      };
    },
  },
);

onMounted(() => {
  setInterval(async () => {
    await refresh();
  }, 10000);
});
</script>

<template>
  <figure
    v-if="overlay"
    class="flex max-h-11 min-h-11 justify-between bg-gradient-to-r from-gray-800/80 via-gray-900/90 to-gray-950"
  >
    <div
      v-if="overlay.project"
      class="flex text-center font-mono text-xl font-semibold text-white"
    >
      <img :src="`/images/games/${overlay.project.id}`" class="me-2 h-11" />

      <UIcon name="i-bi-trophy" class="my-auto me-2 h-5 w-5" />

      <span class="my-auto me-6">
        {{ formatThousands(overlay.project.earnedTrophies, ",") }}/{{
          formatThousands(overlay.project.definedTrophies, ",")
        }}
        ({{ overlay.project.progress }}%)
      </span>

      <UIcon name="i-bi-clock-history" class="my-auto me-2 h-5 w-5" />
      <span class="my-auto">
        {{
          dayjs
            .duration(overlay.project.timeStreamed, "seconds")
            .format("HH:mm")
        }}
      </span>
    </div>

    <div
      v-else
      class="ms-2 flex text-center font-mono text-xl font-semibold text-white"
    >
      <UIcon name="i-bi-playstation" class="my-auto me-2 h-6 w-6" />
      <span class="my-auto">{{ overlay.profile.onlineId }}</span>
    </div>

    <div
      class="ms-2 flex text-center font-mono text-xl font-semibold text-white"
    >
      <UIcon name="i-bi-joystick" class="my-auto me-2 h-5 w-5" />
      <span class="my-auto me-6">
        {{ formatThousands(overlay.profile.completedProjects, ",") }}/{{
          formatThousands(overlay.profile.startedProjects, ",")
        }}
        ({{ overlay.profile.completion }}%)
      </span>

      <UIcon name="i-bi-trophy" class="my-auto me-2 h-5 w-5 text-sky-300" />
      <span class="my-auto me-6 text-sky-300">
        {{ formatThousands(overlay.profile.earnedPlatinum, ",") }}
      </span>

      <UIcon name="i-bi-trophy" class="my-auto me-2 h-5 w-5 text-yellow-400" />
      <span class="my-auto me-6 text-yellow-400">
        {{ formatThousands(overlay.profile.earnedGold, ",") }}
      </span>

      <UIcon name="i-bi-trophy" class="my-auto me-2 h-5 w-5 text-gray-300" />
      <span class="my-auto me-6 text-gray-300">
        {{ formatThousands(overlay.profile.earnedSilver, ",") }}
      </span>

      <UIcon name="i-bi-trophy" class="my-auto me-2 h-5 w-5 text-orange-500" />
      <span class="my-auto me-2 text-orange-500">
        {{ formatThousands(overlay.profile.earnedBronze, ",") }}
      </span>
    </div>
  </figure>
</template>
