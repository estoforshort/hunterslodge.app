<script setup lang="ts">
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";

dayjs.extend(relativeTime);
dayjs.extend(duration);

const route = useRoute();

const { data: trophies } = await useFetch(
  `/api/games/${route.params.game}/groups/${route.params.group}/trophies`,
  {
    transform: (trophies) => {
      return {
        data: trophies.data.map((trophy) => ({
          gameId: trophy.gameId,
          groupId: trophy.groupId,
          trophyId: trophy.trophyId,
          type: trophy.gameTrophy.type,
          name: trophy.gameTrophy.name,
          description: trophy.gameTrophy.description,
          quality: trophy.quality,
          timesEarned: trophy.timesEarned,
          rarity: trophy.rarity,
          value: trophy.value,
        })),
      };
    },
  },
);

const config = useRuntimeConfig();
</script>

<template>
  <div>
    <figure
      v-for="trophy in trophies?.data"
      :key="trophy.trophyId"
      class="mb-2 flex rounded-e-lg bg-gradient-to-r from-white via-white shadow-lg last:mb-0"
      :class="
        trophy.type === 'platinum'
          ? 'to-sky-400 dark:from-gray-900 dark:via-slate-950 dark:to-sky-600'
          : trophy.type === 'gold'
            ? 'to-yellow-400 dark:from-gray-900 dark:via-slate-950 dark:to-yellow-600'
            : trophy.type === 'silver'
              ? 'to-cool-400 dark:from-gray-900 dark:via-slate-950 dark:to-slate-600'
              : 'to-orange-400 dark:from-gray-900 dark:via-slate-950 dark:to-orange-800'
      "
    >
      <NuxtImg
        :src="`${config.public.baseUrl}/images/games/${trophy.gameId}/${trophy.groupId}/${trophy.trophyId}`"
        width="80"
        class="mb-auto min-h-20 min-w-20 max-w-20 justify-start object-contain"
        placeholder
      />

      <div class="mx-2 my-auto flex-auto">
        <div class="flex flex-col justify-between sm:flex-row">
          <p class="text-left font-semibold">{{ trophy.name }}</p>

          <div class="flex">
            <p class="me-3 align-middle">
              <UTooltip
                :text="`Earned by ${trophy.timesEarned} ${trophy.timesEarned === 1 ? 'hunter' : 'hunters'}`"
                class="align-middle"
                :popper="{ placement: 'left', arrow: true }"
              >
                <span class="align-middle">
                  <UIcon
                    name="i-bi-check-circle-fill"
                    class="me-1 align-middle"
                  />
                  <span class="align-middle">{{ trophy.rarity }}%</span>
                </span>
              </UTooltip>
            </p>

            <p class="align-middle">
              <UTooltip
                :text="`${trophy.quality}% quality`"
                class="align-middle"
                :popper="{ placement: 'left', arrow: true }"
              >
                <span class="align-middle">
                  <UIcon name="i-bi-p-circle-fill" class="me-1 align-middle" />
                  <span class="align-middle"> {{ trophy.value }} </span>
                </span>
              </UTooltip>
            </p>
          </div>
        </div>

        <p>{{ trophy.description }}</p>
      </div>
    </figure>
  </div>
</template>
