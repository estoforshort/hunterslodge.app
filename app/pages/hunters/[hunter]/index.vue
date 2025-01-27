<script setup lang="ts">
import relativeTime from "dayjs/plugin/relativeTime";
import formatThousands from "format-thousands";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";

dayjs.extend(relativeTime);
dayjs.extend(duration);

const route = useRoute();

const { data: hunter } = await useFetch(
  `/api/hunters/${route.params.hunter}/summary`,
  {
    transform: (hunter) => {
      if (!hunter.data) {
        return null;
      }

      return {
        firstTrophyEarnedAt: hunter.data.firstTrophyEarnedAt,
        lastTrophyEarnedAt: hunter.data.lastTrophyEarnedAt,
        earnedPlatinum: hunter.data.earnedPlatinum,
        earnedGold: hunter.data.earnedGold,
        earnedSilver: hunter.data.earnedSilver,
        earnedBronze: hunter.data.earnedBronze,
        streamPlatinum: hunter.data.streamPlatinum,
        streamGold: hunter.data.streamGold,
        streamSilver: hunter.data.streamSilver,
        streamBronze: hunter.data.streamBronze,
        hiddenTrophies: hunter.data.hiddenTrophies,
        points: hunter.data.points,
        streamPoints: hunter.data.streamPoints,
        timeStreamed: hunter.data.timeStreamed,
      };
    },
  },
);
</script>

<template>
  <div v-if="hunter">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <UCard>
        <p class="text-lg font-bold">
          {{
            dayjs
              .duration({
                seconds:
                  dayjs().unix() - dayjs(hunter.firstTrophyEarnedAt).unix(),
              })
              .humanize()
          }}
          ago
        </p>
        <p class="text-gray-400 dark:text-gray-500">First trophy</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold">
          {{
            dayjs
              .duration({
                seconds:
                  dayjs().unix() - dayjs(hunter.lastTrophyEarnedAt).unix(),
              })
              .humanize()
          }}
          ago
        </p>
        <p class="text-gray-400 dark:text-gray-500">Last trophy</p>
      </UCard>
    </div>

    <div class="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
      <UCard>
        <p class="text-lg font-bold text-sky-500 dark:text-sky-300">
          {{ formatThousands(hunter.earnedPlatinum, ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Platinum</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold text-yellow-600 dark:text-yellow-400">
          {{ formatThousands(hunter.earnedGold, ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Gold</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold text-gray-500 dark:text-gray-300">
          {{ formatThousands(hunter.earnedSilver, ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Silver</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold text-orange-600 dark:text-orange-500">
          {{ formatThousands(hunter.earnedBronze, ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Bronze</p>
      </UCard>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <UCard>
        <p class="text-lg font-bold">
          {{ formatThousands(hunter.hiddenTrophies, ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Hidden trophies</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold">
          {{ formatThousands(Number(hunter.points), ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Points</p>
      </UCard>
    </div>

    <div
      v-if="
        hunter.streamBronze ||
        hunter.streamSilver ||
        hunter.streamGold ||
        hunter.streamPlatinum
      "
      class="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4"
    >
      <UCard>
        <p class="text-lg font-bold text-sky-500 dark:text-sky-300">
          {{ formatThousands(hunter.streamPlatinum, ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Stream platinum</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold text-yellow-600 dark:text-yellow-400">
          {{ formatThousands(hunter.streamGold, ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Stream gold</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold text-gray-500 dark:text-gray-300">
          {{ formatThousands(hunter.streamSilver, ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Stream silver</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold text-orange-600 dark:text-orange-500">
          {{ formatThousands(hunter.streamBronze, ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Stream bronze</p>
      </UCard>
    </div>

    <div
      v-if="
        hunter.streamBronze ||
        hunter.streamSilver ||
        hunter.streamGold ||
        hunter.streamPlatinum
      "
      class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2"
    >
      <UCard>
        <p class="text-lg font-bold">
          {{
            Math.round(
              dayjs.duration(hunter.timeStreamed, "seconds").as("hours") * 10,
            ) / 10
          }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Stream hours</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold">
          {{ formatThousands(Number(hunter.streamPoints), ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Stream points</p>
      </UCard>
    </div>
  </div>
</template>
