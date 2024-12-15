<script setup lang="ts">
import formatThousands from "format-thousands";

useSeoMeta({
  title: "Home",
});

const { data: stats } = await useFetch("/api/public/v1/statistics");
const config = useRuntimeConfig();
</script>

<template>
  <UPage>
    <UPageBody>
      <div class="flex justify-center">
        <NuxtImg
          :src="`${config.public.baseUrl}/logo.png`"
          width="400"
          height="400"
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
</template>
