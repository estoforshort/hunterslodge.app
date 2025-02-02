<script setup lang="ts">
import formatThousands from "format-thousands";

const route = useRoute();

const { data: game } = await useFetch(
  `/api/games/${route.params.game}/summary`,
  {
    transform: (game) => {
      if (!game.data) {
        return null;
      }

      return {
        quality: game.data.quality,
        timesStarted: game.data.timesStarted,
        timesCompleted: game.data.timesCompleted,
        progress: game.data.avgProgress,
        value: game.data.value,
      };
    },
  },
);

const changes = ref<
  {
    value: string;
    createdAt: string;
  }[]
>([]);

if (game.value) {
  const { data: firstSet } = await useFetch(
    `/api/games/${route.params.game}/changes`,
    {
      transform: (changes) => {
        return {
          data: changes.data.map((change) => ({
            value: change.valueTo,
            createdAt: change.createdAt,
          })),
          page: changes.page,
          pageSize: changes.pageSize,
          totalSize: changes.totalSize,
        };
      },
    },
  );

  if (firstSet.value?.pageSize) {
    changes.value = firstSet.value.data;

    const changesLeft = firstSet.value.totalSize - 100;

    if (changesLeft > 0) {
      const callsToDo = Math.ceil(changesLeft / 100);

      let page = 2;

      for (let c = 0, ctd = callsToDo; c < ctd; c++) {
        const moreChanges = await $fetch(
          `/api/games/${route.params.game}/changes?page=${page}`,
        );

        for (let i = 0, il = moreChanges.data.length; i < il; i++) {
          changes.value.push({
            value: moreChanges.data[i]!.valueTo,
            createdAt: moreChanges.data[i]!.createdAt,
          });
        }

        page++;
      }
    }
  }
}
</script>

<template>
  <div v-if="game">
    <div class="grid grid-cols-2 gap-6 lg:grid-cols-4">
      <UCard>
        <p class="text-lg font-bold">{{ game.quality }}%</p>
        <p class="text-gray-400 dark:text-gray-500">Quality</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold">
          {{ game.timesStarted }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Times started</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold">
          {{ game.timesCompleted }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Times completed</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold">{{ game.progress }}%</p>
        <p class="text-gray-400 dark:text-gray-500">Average progress</p>
      </UCard>
    </div>

    <UCard class="mt-6">
      <p class="text-lg font-bold">
        {{ formatThousands(game.value, ",") }}
      </p>
      <p class="text-gray-400 dark:text-gray-500">Value</p>

      <GamesGameValueChart :changes class="mt-4" />
    </UCard>
  </div>
</template>
