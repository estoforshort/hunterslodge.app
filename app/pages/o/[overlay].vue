<script setup lang="ts">
import formatThousands from "format-thousands";

definePageMeta({
  layout: "overlay",
});

useSeoMeta({
  title: "Overlay",
});

const route = useRoute();

const { data: overlay, refresh } = await useFetch(
  `/api/public/v1/overlay/${route.params.overlay}`,
);

onMounted(() => {
  setInterval(async () => {
    await refresh();
    countTimeStreamed();
  }, 10000);
});

const timeStreamed = ref(0);

function countTimeStreamed() {
  if (overlay.value?.data.project) {
    let time = 0;

    overlay.value.data.project.streams.forEach((stream) => {
      time += stream.timeStreamed;
    });

    return (timeStreamed.value = time);
  }
}
</script>

<template>
  <figure
    v-if="overlay"
    class="flex max-h-11 min-h-11 justify-between bg-gradient-to-r from-gray-700/70 via-gray-800/80 to-gray-900/90"
  >
    <div
      v-if="overlay.data.project"
      class="flex text-center font-mono text-xl font-semibold text-white"
    >
      <img :src="overlay.data.project.stack.game.imageUrl" class="me-2 h-11" />

      <UIcon name="i-bi-trophy" class="my-auto me-2 h-5 w-5" />
      <span class="my-auto me-6">
        {{
          formatThousands(
            overlay.data.project.earnedPlatinum +
              overlay.data.project.earnedGold +
              overlay.data.project.earnedSilver +
              overlay.data.project.earnedBronze,
            ",",
          )
        }}/{{
          formatThousands(
            overlay.data.project.stack.definedPlatinum +
              overlay.data.project.stack.definedGold +
              overlay.data.project.stack.definedSilver +
              overlay.data.project.stack.definedBronze,
            ",",
          )
        }}
        ({{ overlay.data.project.progress }}%)
      </span>

      <UIcon name="i-bi-clock-history" class="my-auto me-2 h-5 w-5" />
      <span class="my-auto">{{
        dayjs.duration(timeStreamed, "seconds").format("HH:mm:ss")
      }}</span>
    </div>

    <div
      v-else
      class="ms-2 flex text-center font-mono text-xl font-semibold text-white"
    >
      <UIcon name="i-bi-playstation" class="my-auto me-2 h-6 w-6" />
      <span class="my-auto">{{ overlay.data.profile.onlineId }}</span>
    </div>

    <div
      class="ms-2 flex text-center font-mono text-xl font-semibold text-white"
    >
      <UIcon name="i-bi-joystick" class="my-auto me-2 h-5 w-5" />
      <span class="my-auto me-6">
        {{ formatThousands(overlay.data.profile.completedProjects, ",") }}/{{
          formatThousands(overlay.data.profile.startedProjects, ",")
        }}
        ({{ overlay.data.profile.completion }}%)
      </span>

      <UIcon name="i-bi-trophy" class="my-auto me-2 h-5 w-5 text-sky-300" />
      <span class="my-auto me-6 text-sky-300">{{
        formatThousands(overlay.data.profile.earnedPlatinum, ",")
      }}</span>

      <UIcon name="i-bi-trophy" class="my-auto me-2 h-5 w-5 text-yellow-500" />
      <span class="my-auto me-6 text-yellow-500">{{
        formatThousands(overlay.data.profile.earnedGold, ",")
      }}</span>

      <UIcon name="i-bi-trophy" class="my-auto me-2 h-5 w-5 text-gray-300" />
      <span class="my-auto me-6 text-gray-300">{{
        formatThousands(overlay.data.profile.earnedSilver, ",")
      }}</span>

      <UIcon name="i-bi-trophy" class="my-auto me-2 h-5 w-5 text-orange-500" />
      <span class="my-auto me-2 text-orange-500">{{
        formatThousands(overlay.data.profile.earnedBronze, ",")
      }}</span>
    </div>
  </figure>
</template>
