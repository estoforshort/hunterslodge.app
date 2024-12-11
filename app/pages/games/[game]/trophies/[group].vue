<script setup lang="ts">
import relativeTime from "dayjs/plugin/relativeTime";
import formatThousands from "format-thousands";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";

dayjs.extend(relativeTime);
dayjs.extend(duration);

const route = useRoute();

const { data: trophies } = await useFetch(
  `/api/public/v1/stacks/${route.params.game}/groups/${route.params.group}/trophies`,
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
      class="mb-2 flex rounded-e-lg shadow-lg last:mb-0"
      :class="useTrophyBackground(trophy.type)"
    >
      <img
        :src="`${config.public.baseUrl}/images/games/${trophy.gameId}/${trophy.groupId}/${trophy.trophyId}`"
        class="mb-auto min-h-20 min-w-20 max-w-20 justify-start object-contain"
      />

      <div class="mx-2 my-auto flex-auto">
        <div class="flex flex-col justify-between sm:flex-row">
          <p class="text-left font-semibold">{{ trophy.name }}</p>

          <div class="flex">
            <p class="me-3 align-middle">
              <UTooltip
                text="Quality"
                class="align-middle"
                :popper="{ placement: 'left', arrow: true }"
              >
                <span class="align-middle">
                  <UIcon name="i-bi-award-fill" class="me-1 align-middle" />
                  <span class="align-middle"> {{ trophy.quality }}% </span>
                </span>
              </UTooltip>
            </p>

            <p class="me-3 align-middle">
              <UTooltip
                text="Times earned"
                class="align-middle"
                :popper="{ placement: 'left', arrow: true }"
              >
                <span class="align-middle">
                  <UIcon
                    name="i-bi-check-circle-fill"
                    class="me-1 align-middle"
                  />
                  <span class="align-middle">{{ trophy.timesEarned }}</span>
                </span>
              </UTooltip>
            </p>

            <p class="me-3 align-middle">
              <UTooltip
                text="Rarity ratio"
                class="align-middle"
                :popper="{ placement: 'left', arrow: true }"
              >
                <span class="align-middle">
                  <UIcon name="i-bi-r-circle-fill" class="me-1 align-middle" />
                  <span class="align-middle">{{ trophy.rarity }}</span>
                </span>
              </UTooltip>
            </p>

            <p class="align-middle">
              <UTooltip
                text="Point value"
                class="align-middle"
                :popper="{ placement: 'left', arrow: true }"
              >
                <span class="align-middle">
                  <UIcon name="i-bi-p-circle-fill" class="me-1 align-middle" />
                  <span class="align-middle">{{
                    formatThousands(trophy.value, ",")
                  }}</span>
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
