<script setup lang="ts">
import formatThousands from "format-thousands";

const route = useRoute();

const { data: game } = await useFetch(
  `/api/public/v1/stacks/${route.params.game}`,
  {
    transform: (game) => {
      if (!game.data) {
        return null;
      }

      return {
        definedPlatinum: game.data.definedPlatinum,
        definedGold: game.data.definedGold,
        definedSilver: game.data.definedSilver,
        definedBronze: game.data.definedBronze,
        quality: game.data.quality,
        timesStarted: game.data.timesStarted,
        rarity: game.data.rarity,
        timesCompleted: game.data.timesCompleted,
        progress: game.data.avgProgress,
        value: game.data.value,
      };
    },
  },
);
</script>

<template>
  <div v-if="game">
    <div class="grid grid-cols-2 gap-6 lg:grid-cols-4">
      <UCard>
        <p class="text-lg font-bold text-sky-500 dark:text-sky-300">
          {{ game.definedPlatinum }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Platinum</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold text-yellow-600 dark:text-yellow-400">
          {{ game.definedGold }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Gold</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold text-gray-500 dark:text-gray-300">
          {{ game.definedSilver }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Silver</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold text-orange-600 dark:text-orange-500">
          {{ game.definedBronze }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Bronze</p>
      </UCard>

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
          {{ game.rarity }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Rarity</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold">
          {{ game.timesCompleted }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Times completed</p>
      </UCard>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <UCard>
        <p class="text-lg font-bold">{{ game.progress }}%</p>
        <p class="text-gray-400 dark:text-gray-500">Average progress</p>
      </UCard>

      <UCard>
        <p class="text-lg font-bold">
          {{ formatThousands(Number(game.value), ",") }}
        </p>
        <p class="text-gray-400 dark:text-gray-500">Value</p>
      </UCard>
    </div>
  </div>
</template>
