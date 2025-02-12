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

const { data: overlay, refresh: refreshOverlay } = await useFetch(
  `/api/overlays/${route.params.overlay}`,
  {
    transform: (overlay) => {
      if (!overlay.data) {
        return null;
      }

      return {
        style: overlay.data.style,
        profile: {
          displayName: overlay.data.profile.user?.displayName,
          onlineId: overlay.data.profile.onlineId,
          startedProjects: overlay.data.profile.startedProjects,
          completedProjects: overlay.data.profile.completedProjects,
          earnedPlatinum: overlay.data.profile.earnedPlatinum,
          earnedGold: overlay.data.profile.earnedGold,
          earnedSilver: overlay.data.profile.earnedSilver,
          earnedBronze: overlay.data.profile.earnedBronze,
          streamPlatinum: overlay.data.profile.streamPlatinum,
          streamGold: overlay.data.profile.streamGold,
          streamSilver: overlay.data.profile.streamSilver,
          streamBronze: overlay.data.profile.streamBronze,
          completion: overlay.data.profile.completion,
          streamPoints: overlay.data.profile.streamPoints,
          timeStreamed: overlay.data.profile.timeStreamed,
          streamPosition: overlay.data.profile.streamPosition,
        },
        project: overlay.data.project
          ? {
              id: overlay.data.project.stackId,
              gameId: overlay.data.project.stack.gameId,
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
              value: Number(overlay.data.project.stack.value),
              points: Number(overlay.data.project.points),
              timeStreamed: overlay.data.project.timeStreamed,
            }
          : null,
      };
    },
  },
);

const { data: streamers, refresh: refreshStreamers } = await useFetch(
  "/api/hunters",
  {
    query: { orderBy: "streamPosition", direction: "asc", onlyStreamers: true },
    transform: (streamers) => {
      return streamers.data.map((streamer) => ({
        points: Number(streamer.streamPoints),
        position: streamer.streamPosition,
      }));
    },
  },
);

const pointsBehind = ref(0);
const pointsAhead = ref(0);

onMounted(() => {
  setInterval(async () => {
    await refreshOverlay();

    if (overlay.value?.style === "streamer") {
      await refreshStreamers();

      if (overlay.value?.profile && streamers.value) {
        if (overlay.value.profile.streamPosition > 1) {
          const personAhead = streamers.value.find(
            (p) => p.position === overlay.value!.profile.streamPosition - 1,
          );

          if (personAhead) {
            pointsBehind.value =
              Math.round(
                (personAhead.points -
                  Number(overlay.value?.profile.streamPoints)) *
                  100,
              ) / 100;
          }
        }

        if (overlay.value.profile.streamPosition < streamers.value.length) {
          const personBehind = streamers.value.find(
            (p) => p.position === overlay.value!.profile.streamPosition + 1,
          );

          if (personBehind) {
            pointsAhead.value =
              Math.round(
                (Number(overlay.value?.profile.streamPoints) -
                  personBehind.points) *
                  100,
              ) / 100;
          }
        }
      }
    }
  }, 5000);
});
</script>

<template>
  <figure
    v-if="overlay"
    class="flex max-h-11 min-h-11 justify-between bg-gradient-to-r from-gray-950 via-gray-800/80 to-gray-950"
  >
    <div
      v-if="overlay.project"
      class="flex text-center font-mono text-xl font-semibold text-white"
    >
      <img :src="`/images/games/${overlay.project.gameId}`" class="me-2 h-11" />

      <UIcon
        v-if="overlay.project.progress === 100"
        name="i-bi-trophy-fill"
        class="my-auto me-2 h-5 w-5"
      />

      <UIcon v-else name="i-bi-trophy" class="my-auto me-2 h-5 w-5" />

      <span class="my-auto me-6">
        {{ formatThousands(overlay.project.earnedTrophies, ",") }}/{{
          formatThousands(overlay.project.definedTrophies, ",")
        }}
        ({{ overlay.project.progress }}%)
      </span>

      <UIcon
        v-if="overlay.style === 'streamer'"
        name="i-bi-piggy-bank-fill"
        class="my-auto me-2 h-5 w-5"
      />
      <span v-if="overlay.style === 'streamer'" class="my-auto me-6">
        {{ overlay.project.progress !== 100 ? "≈" : ""
        }}{{
          formatThousands(
            Math.round((overlay.project.value - overlay.project.points) * 100) /
              100,
            ",",
          )
        }}
      </span>

      <UIcon
        v-if="overlay.style !== 'streamer'"
        name="i-bi-camera-video-fill"
        class="my-auto me-2 h-5 w-5"
      />
      <span v-if="overlay.style !== 'streamer'" class="my-auto">
        {{
          Math.round(
            dayjs
              .duration(overlay.project.timeStreamed, "seconds")
              .as("hours") * 10,
          ) / 10
        }}h
      </span>
    </div>

    <div
      v-else
      class="ms-2 flex text-center font-mono text-xl font-semibold text-white"
    >
      <UIcon
        v-if="overlay.style === 'default'"
        name="i-bi-playstation"
        class="my-auto me-2 h-6 w-6"
      />
      <UIcon
        v-if="overlay.style === 'streamer'"
        name="i-bi-twitch"
        class="my-auto me-2 h-6 w-6"
      />

      <span v-if="overlay.style === 'default'" class="my-auto">
        {{ overlay.profile.onlineId }}
      </span>
      <span v-if="overlay.style === 'streamer'" class="my-auto">
        {{ overlay.profile.displayName }}
      </span>
    </div>

    <div
      v-if="overlay.style === 'default'"
      class="ms-2 flex text-center font-mono text-xl font-semibold text-white"
    >
      <UIcon name="i-bi-joystick" class="my-auto me-2 h-5 w-5" />
      <span class="my-auto me-6">
        {{ formatThousands(overlay.profile.completedProjects, ",") }}/{{
          formatThousands(overlay.profile.startedProjects, ",")
        }}
        ({{ overlay.profile.completion }}%)
      </span>

      <UIcon
        name="i-bi-trophy-fill"
        class="my-auto me-2 h-5 w-5 text-sky-300"
      />
      <span class="my-auto me-6 text-sky-300">
        {{ formatThousands(overlay.profile.earnedPlatinum, ",") }}
      </span>

      <UIcon
        name="i-bi-trophy-fill"
        class="my-auto me-2 h-5 w-5 text-yellow-400"
      />
      <span class="my-auto me-6 text-yellow-400">
        {{ formatThousands(overlay.profile.earnedGold, ",") }}
      </span>

      <UIcon
        name="i-bi-trophy-fill"
        class="my-auto me-2 h-5 w-5 text-gray-300"
      />
      <span class="my-auto me-6 text-gray-300">
        {{ formatThousands(overlay.profile.earnedSilver, ",") }}
      </span>

      <UIcon
        name="i-bi-trophy-fill"
        class="my-auto me-2 h-5 w-5 text-orange-500"
      />
      <span class="my-auto me-2 text-orange-500">
        {{ formatThousands(overlay.profile.earnedBronze, ",") }}
      </span>
    </div>

    <div
      v-if="overlay.style === 'streamer'"
      class="ms-2 flex text-center font-mono text-xl font-semibold text-white"
    >
      <span v-if="overlay.profile.streamPosition" class="my-auto">
        <div v-if="streamers" class="align-middle font-mono">
          <span v-if="pointsBehind" class="me-6 align-middle text-red-400">
            <UBadge color="red" variant="soft" class="align-middle text-sm">
              {{ ordinal(overlay.profile.streamPosition - 1) }}
            </UBadge>
            +{{ formatThousands(pointsBehind, ",") }}</span
          >

          <span class="align-middle" :class="pointsAhead ? 'me-6' : 'me-2'">
            <UBadge color="black" variant="soft" class="align-middle text-sm">
              {{ ordinal(overlay.profile.streamPosition) }}
            </UBadge>
            {{ formatThousands(overlay.profile.streamPoints, ",") }}
          </span>

          <span v-if="pointsAhead" class="me-2 align-middle text-green-500">
            <UBadge color="green" variant="soft" class="align-middle text-sm">
              {{ ordinal(overlay.profile.streamPosition + 1) }}
            </UBadge>
            -{{ formatThousands(pointsAhead, ",") }}
          </span>
        </div>
      </span>
    </div>
  </figure>
</template>
