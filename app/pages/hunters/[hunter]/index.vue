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
        firstTrophyEarnedAt: profile.data.firstTrophyEarnedAt,
        lastTrophyEarnedAt: profile.data.lastTrophyEarnedAt,
        earnedPlatinum: profile.data.earnedPlatinum,
        earnedGold: profile.data.earnedGold,
        earnedSilver: profile.data.earnedSilver,
        earnedBronze: profile.data.earnedBronze,
        streamPlatinum: profile.data.streamPlatinum,
        streamGold: profile.data.streamGold,
        streamSilver: profile.data.streamSilver,
        streamBronze: profile.data.streamBronze,
        hiddenTrophies: profile.data.hiddenTrophies,
        points: profile.data.points,
        streamPoints: profile.data.streamPoints,
        timeStreamed: profile.data.timeStreamed,
      };
    },
  },
);
</script>

<template>
  <div v-if="profile">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <UCard>
        <p class="text-lg font-bold">
          {{
            dayjs
              .duration({
                seconds:
                  dayjs().unix() - dayjs(profile.firstTrophyEarnedAt).unix(),
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
                  dayjs().unix() - dayjs(profile.lastTrophyEarnedAt).unix(),
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

    <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <UCard>
        <p class="text-lg font-bold">
          {{ formatThousands(profile.hiddenTrophies, ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Hidden trophies</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold">
          {{ formatThousands(Number(profile.points), ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Points</p>
      </UCard>
    </div>

    <div
      v-if="
        profile.streamBronze ||
        profile.streamSilver ||
        profile.streamGold ||
        profile.streamPlatinum
      "
      class="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4"
    >
      <UCard>
        <p class="text-lg font-bold text-sky-500 dark:text-sky-300">
          {{ formatThousands(profile.streamPlatinum, ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Stream platinum</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold text-yellow-600 dark:text-yellow-400">
          {{ formatThousands(profile.streamGold, ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Stream gold</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold text-gray-500 dark:text-gray-300">
          {{ formatThousands(profile.streamSilver, ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Stream silver</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold text-orange-600 dark:text-orange-500">
          {{ formatThousands(profile.streamBronze, ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Stream bronze</p>
      </UCard>
    </div>

    <div
      v-if="
        profile.streamBronze ||
        profile.streamSilver ||
        profile.streamGold ||
        profile.streamPlatinum
      "
      class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2"
    >
      <UCard>
        <p class="text-lg font-bold">
          {{
            Math.round(
              dayjs.duration(profile.timeStreamed, "seconds").as("hours") * 10,
            ) / 10
          }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Stream hours</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold">
          {{ formatThousands(Number(profile.streamPoints), ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Stream points</p>
      </UCard>
    </div>
  </div>
</template>
