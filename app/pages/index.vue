<script setup lang="ts">
import formatThousands from "format-thousands";

useSeoMeta({
  title: "Home",
});

const { data: stats } = await useFetch("/api/public/v1/statistics");
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

        <ULandingHero title="Welcome to the Lodge, Hunter!" />

        <ULandingGrid>
          <ULandingCard
            class="col-span-6 row-span-2"
            icon="i-bi-joystick"
            :title="formatThousands(stats?.data?.stacks, ',')"
            description="Games tracked"
          />

          <ULandingCard
            class="col-span-6 row-span-2"
            icon="i-bi-trophy"
            :title="formatThousands(stats?.data?.stackTrophies, ',')"
            description="Trophies tracked"
          />

          <ULandingCard
            class="col-span-4 row-span-2"
            icon="i-bi-people"
            :title="stats?.data?.profiles.toString()"
            description="Hunters joined"
          />

          <ULandingCard
            class="col-span-4 row-span-2"
            icon="i-bi-joystick"
            :title="formatThousands(stats?.data?.projects, ',')"
            description="Games started"
          />

          <ULandingCard
            class="col-span-4 row-span-2"
            icon="i-bi-trophy"
            :title="formatThousands(stats?.data?.earnedTrophies, ',')"
            description="Trophies earned"
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
