<script setup lang="ts">
import relativeTime from "dayjs/plugin/relativeTime";
import formatThousands from "format-thousands";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";

dayjs.extend(relativeTime);
dayjs.extend(duration);

useSeoMeta({
  title: "Home",
});

const { data: stats } = await useFetch("/api/app/statistics", {
  transform: (stats) => {
    return {
      data: {
        stacks: formatThousands(stats.data.stacks, ","),
        stackTrophies: formatThousands(stats.data.stackTrophies, ","),
        profiles: formatThousands(stats.data.profiles, ","),
        streamers: formatThousands(stats.data.streamers, ","),
        timeStreamed: formatThousands(
          Math.round(
            dayjs
              .duration(stats?.data.timeStreamed ?? 0, "seconds")
              .as("hours") * 10,
          ) / 10,
          ",",
        ),
        earnedStreamTrophies: formatThousands(
          stats.data.earnedStreamTrophies,
          ",",
        ),
        totalEarnedTrophies: formatThousands(
          stats.data.totalEarnedTrophies,
          ",",
        ),
      },
    };
  },
});

const config = useRuntimeConfig();
</script>

<template>
  <div>
    <div
      class="landing-grid absolute inset-0 z-[-1] [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
    />

    <UPage>
      <UPageBody>
        <div class="mt-24 flex justify-center">
          <NuxtImg
            :src="`${config.public.baseUrl}/logo.png`"
            width="441"
            height="441"
            class="rotate-3 hover:-rotate-1"
          />
        </div>

        <ULandingHero
          title="Welcome to the Lodge, Hunter!"
          description="Hunters Lodge is the web app for PlayStation trophy hunters on Twitch."
          :links="[
            {
              label: 'Read more about us',
              trailingIcon: 'i-heroicons-arrow-right',
              color: 'gray',
              size: 'xl',
              to: '/docs',
            },
          ]"
        />

        <ULandingGrid>
          <ULandingCard
            class="col-span-4 row-span-2"
            icon="i-bi-joystick"
            :title="stats?.data.stacks"
            description="Games tracked"
          />

          <ULandingCard
            class="col-span-5 row-span-2"
            icon="i-bi-trophy"
            :title="stats?.data.stackTrophies"
            description="Trophies tracked"
          />

          <ULandingCard
            class="col-span-3 row-span-2"
            icon="i-bi-people"
            :title="stats?.data.profiles"
            description="Hunters joined"
          />

          <ULandingCard
            class="col-span-5 row-span-2"
            icon="i-bi-twitch"
            :title="stats?.data.streamers"
            description="Streamers"
          />

          <ULandingCard
            class="col-span-7 row-span-2"
            icon="i-bi-hourglass-split"
            :title="stats?.data.timeStreamed"
            description="Hours streamed"
          />

          <ULandingCard
            class="col-span-4 row-span-2"
            icon="i-bi-trophy"
            :title="stats?.data.earnedStreamTrophies"
            description="Trophies earned on stream"
          />

          <ULandingCard
            class="col-span-8 row-span-2"
            icon="i-bi-trophy"
            :title="stats?.data.totalEarnedTrophies"
            description="Total trophies earned"
          />
        </ULandingGrid>
      </UPageBody>
    </UPage>
  </div>
</template>

<style scoped>
.landing-grid {
  background-size: 100px 100px;
  background-image: linear-gradient(
      to right,
      rgb(var(--color-gray-200)) 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, rgb(var(--color-gray-200)) 1px, transparent 1px);
}
.dark {
  .landing-grid {
    background-image: linear-gradient(
        to right,
        rgb(var(--color-gray-800)) 1px,
        transparent 1px
      ),
      linear-gradient(
        to bottom,
        rgb(var(--color-gray-800)) 1px,
        transparent 1px
      );
  }
}
</style>
