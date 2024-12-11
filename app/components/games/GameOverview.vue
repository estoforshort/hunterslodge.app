<script setup lang="ts">
import relativeTime from "dayjs/plugin/relativeTime";
import formatThousands from "format-thousands";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";

dayjs.extend(relativeTime);
dayjs.extend(duration);

const props = defineProps<{
  game: {
    stackId: string;
    gameId: number;
    name: string;
    platforms: {
      platformId: string;
    }[];
    definedPlatinum: number;
    definedGold: number;
    definedSilver: number;
    definedBronze: number;
    firstTrophyEarnedAt: string | null;
    lastTrophyEarnedAt: string | null;
    quality: string;
    timesStarted: number;
    timesCompleted: number;
    progress: number;
    value: string;
  };
}>();

const config = useRuntimeConfig();
</script>

<template>
  <NuxtLink :to="`/games/${props.game.stackId}`">
    <figure
      class="flex rounded-lg bg-gradient-to-r from-white via-white to-gray-200 shadow-lg dark:from-gray-900 dark:via-slate-950 dark:to-slate-950"
    >
      <div class="flex bg-gray-200 dark:bg-gray-800">
        <div class="my-auto max-w-20">
          <NuxtImg
            :src="`${config.public.baseUrl}/images/games/${game.gameId}`"
            width="80"
            class="min-h-20 min-w-20 object-contain"
            placeholder
          />
        </div>
      </div>

      <div class="mx-2 my-2 flex-auto lg:my-auto">
        <div class="flex justify-between">
          <div>
            <UBadge
              v-for="platform in game.platforms"
              :key="platform.platformId"
              color="gray"
              variant="solid"
              size="xs"
              class="me-1 align-middle"
              >{{ platform.platformId.toUpperCase() }}</UBadge
            >
            <span class="align-middle">{{ game.name }}</span>
          </div>

          <div class="flex">
            <UPopover mode="hover" :popper="{ placement: 'auto' }">
              <span class="align-middle">
                <UIcon name="i-bi-info-circle" class="align-middle" />
              </span>

              <template #panel>
                <div class="p-2">
                  <p class="text-sm">
                    First trophy
                    {{
                      dayjs
                        .duration({
                          seconds:
                            dayjs().unix() -
                            dayjs(game.firstTrophyEarnedAt).unix(),
                        })
                        .humanize()
                    }}
                    and last
                    {{
                      dayjs
                        .duration({
                          seconds:
                            dayjs().unix() -
                            dayjs(game.lastTrophyEarnedAt).unix(),
                        })
                        .humanize()
                    }}
                    ago
                  </p>
                </div>
              </template>
            </UPopover>
          </div>
        </div>

        <div class="mb-1 mt-1 flex flex-col justify-between lg:flex-row">
          <div class="mb-3 flex flex-row lg:mb-0">
            <span
              v-if="game.definedPlatinum"
              class="me-4 text-sky-500 dark:text-sky-300"
            >
              <span class="align-middle">
                <UIcon name="i-bi-trophy" class="me-1 align-middle" />
                <span class="align-middle">
                  {{ game.definedPlatinum }}
                </span>
              </span>
            </span>

            <span
              v-if="game.definedGold"
              class="me-4 text-yellow-600 dark:text-yellow-400"
            >
              <span class="align-middle">
                <UIcon name="i-bi-trophy" class="me-1 align-middle" />
                <span class="align-middle">
                  {{ game.definedGold }}
                </span>
              </span>
            </span>

            <span
              v-if="game.definedSilver"
              class="me-4 text-gray-500 dark:text-gray-300"
            >
              <span class="align-middle">
                <UIcon name="i-bi-trophy" class="me-1 align-middle" />
                <span class="align-middle">
                  {{ game.definedSilver }}
                </span>
              </span>
            </span>

            <span
              v-if="game.definedBronze"
              class="me-4 text-orange-600 dark:text-orange-500"
            >
              <span class="align-middle">
                <UIcon name="i-bi-trophy" class="me-1 align-middle" />
                <span class="align-middle">
                  {{ game.definedBronze }}
                </span>
              </span>
            </span>
          </div>

          <div class="flex flex-row justify-between">
            <span class="align-middle">
              <UIcon name="i-bi-award-fill" class="me-2 align-middle" />
              <UTooltip
                text="Quality"
                class="align-middle"
                :popper="{ placement: 'top', arrow: true }"
              >
                <span class="me-4 align-middle">{{ game.quality }}%</span>
              </UTooltip>
            </span>

            <span class="align-middle">
              <UIcon name="i-bi-check-circle-fill" class="me-2 align-middle" />
              <UTooltip
                text="Times completed/started"
                class="align-middle"
                :popper="{ placement: 'top', arrow: true }"
              >
                <span class="me-4 align-middle">
                  {{ game.timesCompleted }} / {{ game.timesStarted }}
                </span>
              </UTooltip>
            </span>

            <span class="align-middle">
              <UIcon name="i-bi-p-circle-fill" class="me-2 align-middle" />
              <UTooltip
                text="Point value"
                class="align-middle"
                :popper="{ placement: 'top', arrow: true }"
              >
                <span class="me-4 align-middle">
                  {{
                    formatThousands(Number(game.value), {
                      separator: ",",
                    })
                  }}
                </span>
              </UTooltip>
            </span>

            <span>
              <UTooltip
                text="Average progress"
                class="align-middle"
                :popper="{ placement: 'top', arrow: true }"
              >
                <span>{{ game.progress }}%</span>
              </UTooltip>
            </span>
          </div>
        </div>

        <div>
          <UMeter
            :min="0"
            :max="100"
            :value="game.progress"
            size="xs"
            color="gray"
          />
        </div>
      </div>
    </figure>
  </NuxtLink>
</template>
