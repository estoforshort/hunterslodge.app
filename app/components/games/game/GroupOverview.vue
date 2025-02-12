<script setup lang="ts">
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";

dayjs.extend(relativeTime);
dayjs.extend(duration);

defineProps<{
  group: {
    gameId: number;
    groupId: string;
    name: string;
    definedPlatinum: number;
    definedGold: number;
    definedSilver: number;
    definedBronze: number;
    firstTrophyEarnedAt: string | null;
    lastTrophyEarnedAt: string | null;
    quality: string;
    timesCompleted: number;
    progress: number;
    value: string;
  };
}>();

const config = useRuntimeConfig();
const route = useRoute();
</script>

<template>
  <NuxtLink :to="`/games/${route.params.game}/trophies/${group.groupId}`">
    <figure
      class="flex rounded-lg bg-gradient-to-r from-white via-white to-gray-200 shadow-lg dark:from-gray-900 dark:via-slate-950 dark:to-slate-950"
    >
      <div class="flex bg-gray-200 dark:bg-gray-800">
        <div class="my-auto max-w-20">
          <NuxtImg
            :src="`${config.public.baseUrl}/images/games/${group.gameId}/${group.groupId}`"
            width="80"
            class="min-h-20 min-w-20 object-contain"
            placeholder
          />
        </div>
      </div>

      <div class="mx-2 my-2 flex-auto lg:my-auto">
        <div class="flex justify-between">
          <div>
            <span class="align-middle">{{ group.name }}</span>
          </div>

          <div class="flex">
            <UPopover mode="hover" :popper="{ placement: 'left-start' }">
              <span class="align-middle">
                <UIcon name="i-bi-info-circle" class="align-middle" />
              </span>

              <template #panel>
                <div class="p-2">
                  <p v-if="group.firstTrophyEarnedAt" class="text-sm">
                    <UIcon
                      name="i-bi-hourglass-top"
                      class="me-2 align-middle"
                    />
                    <span class="align-middle">
                      {{
                        dayjs
                          .duration({
                            seconds:
                              dayjs().unix() -
                              dayjs(group.firstTrophyEarnedAt).unix(),
                          })
                          .humanize()
                      }}
                      ago
                    </span>
                  </p>

                  <p v-if="group.lastTrophyEarnedAt" class="text-sm">
                    <UIcon
                      name="i-bi-hourglass-bottom"
                      class="me-2 align-middle"
                    />
                    <span class="align-middle">
                      {{
                        dayjs
                          .duration({
                            seconds:
                              dayjs().unix() -
                              dayjs(group.lastTrophyEarnedAt).unix(),
                          })
                          .humanize()
                      }}
                      ago
                    </span>
                  </p>

                  <p class="text-sm">
                    <UIcon name="i-bi-award-fill" class="me-2 align-middle" />
                    <span class="align-middle"> {{ group.quality }}% </span>
                  </p>

                  <p class="text-sm">
                    <UIcon
                      name="i-bi-check-circle-fill"
                      class="me-2 align-middle"
                    />
                    <span class="align-middle">
                      {{ group.timesCompleted }}
                    </span>
                  </p>
                </div>
              </template>
            </UPopover>
          </div>
        </div>

        <div class="mb-1 mt-1 flex flex-col justify-between lg:flex-row">
          <div class="mb-3 flex flex-row lg:mb-0">
            <span
              v-if="group.definedPlatinum"
              class="me-4 text-sky-500 dark:text-sky-300"
            >
              <span class="align-middle">
                <UIcon name="i-bi-trophy" class="me-1 align-middle" />
                <span class="align-middle">
                  {{ group.definedPlatinum }}
                </span>
              </span>
            </span>

            <span
              v-if="group.definedGold"
              class="me-4 text-yellow-600 dark:text-yellow-400"
            >
              <span class="align-middle">
                <UIcon name="i-bi-trophy" class="me-1 align-middle" />
                <span class="align-middle">
                  {{ group.definedGold }}
                </span>
              </span>
            </span>

            <span
              v-if="group.definedSilver"
              class="me-4 text-gray-500 dark:text-gray-300"
            >
              <span class="align-middle">
                <UIcon name="i-bi-trophy" class="me-1 align-middle" />
                <span class="align-middle">
                  {{ group.definedSilver }}
                </span>
              </span>
            </span>

            <span
              v-if="group.definedBronze"
              class="me-4 text-orange-600 dark:text-orange-500"
            >
              <span class="align-middle">
                <UIcon name="i-bi-trophy" class="me-1 align-middle" />
                <span class="align-middle">
                  {{ group.definedBronze }}
                </span>
              </span>
            </span>
          </div>

          <div class="flex flex-row justify-between">
            <span class="align-middle">
              <UIcon name="i-bi-p-circle-fill" class="me-2 align-middle" />
              <UTooltip
                text="Point value"
                class="align-middle"
                :popper="{ placement: 'top', arrow: true }"
              >
                <span class="me-4 align-middle">
                  {{ group.value }}
                </span>
              </UTooltip>
            </span>

            <span>
              <UTooltip
                text="Average progress"
                class="align-middle"
                :popper="{ placement: 'top', arrow: true }"
              >
                <span>{{ group.progress }}%</span>
              </UTooltip>
            </span>
          </div>
        </div>

        <div>
          <UMeter
            :min="0"
            :max="100"
            :value="group.progress"
            size="xs"
            color="gray"
          />
        </div>
      </div>
    </figure>
  </NuxtLink>
</template>
