<script setup lang="ts">
import relativeTime from "dayjs/plugin/relativeTime";
import formatThousands from "format-thousands";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";

dayjs.extend(relativeTime);
dayjs.extend(duration);

const props = defineProps<{
  group: {
    gameId: number;
    groupId: string;
    name: string;
    definedPlatinum: number;
    definedGold: number;
    definedSilver: number;
    definedBronze: number;
    earnedPlatinum: number;
    earnedGold: number;
    earnedSilver: number;
    earnedBronze: number;
    streamPlatinum: number;
    streamGold: number;
    streamSilver: number;
    streamBronze: number;
    firstTrophyEarnedAt: string | null;
    lastTrophyEarnedAt: string | null;
    progress: number;
    points: string;
    streamPoints: string;
  };
}>();

const config = useRuntimeConfig();

const definedGoldPoints = props.group.definedGold * 90;
const definedSilverPoints = props.group.definedSilver * 30;
const definedBronzePoints = props.group.definedBronze * 15;

const earnedStreamGoldPoints = props.group.streamGold * 90;
const earnedStreamSilverPoints = props.group.streamSilver * 30;
const earnedStreamBronzePoints = props.group.streamBronze * 15;

const definedPoints =
  definedGoldPoints + definedSilverPoints + definedBronzePoints;
const earnedStreamPoints =
  earnedStreamGoldPoints + earnedStreamSilverPoints + earnedStreamBronzePoints;

let streamProgress = (earnedStreamPoints / definedPoints) * 100;

if (streamProgress < 1 && streamProgress > 0) {
  streamProgress = Math.ceil(streamProgress);
} else {
  streamProgress = Math.floor(streamProgress);
}

const route = useRoute();
</script>

<template>
  <NuxtLink
    :to="`/hunters/${route.params.hunter}/projects/${route.params.project}/${group.groupId}`"
  >
    <figure
      class="flex rounded-lg border-e-8 bg-gradient-to-r from-white via-white to-gray-200 shadow-lg dark:from-gray-900 dark:via-slate-950 dark:to-slate-950"
      :class="
        group.progress === 100
          ? streamProgress === 100
            ? 'border-primary'
            : 'border-green-500 dark:border-green-400'
          : group.earnedPlatinum
            ? 'border-sky-500 dark:border-sky-400'
            : 'border-gray-200 dark:border-gray-950'
      "
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

          <div v-if="group.firstTrophyEarnedAt" class="flex">
            <UPopover mode="hover" :popper="{ placement: 'auto' }">
              <span class="align-middle">
                <UIcon name="i-bi-info-circle" class="align-middle" />
              </span>

              <template #panel>
                <div class="p-2">
                  <p v-if="group.progress !== 100" class="text-sm">
                    Started
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
                  </p>

                  <p v-else class="text-sm">
                    Completed in
                    {{
                      dayjs
                        .duration({
                          seconds:
                            dayjs(group.lastTrophyEarnedAt).unix() -
                            dayjs(group.firstTrophyEarnedAt).unix(),
                        })
                        .humanize()
                    }},
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
              <UTooltip
                :text="`Out of ${group.definedPlatinum}`"
                class="align-middle"
                :popper="{ placement: 'top', arrow: true }"
              >
                <span class="align-middle">
                  <UIcon name="i-bi-trophy" class="me-1 align-middle" />
                  <span class="align-middle">
                    {{ group.earnedPlatinum }}
                  </span>
                </span>
              </UTooltip>
            </span>

            <span
              v-if="group.definedGold"
              class="me-4 text-yellow-600 dark:text-yellow-400"
            >
              <UTooltip
                :text="`Out of ${group.definedGold}`"
                class="align-middle"
                :popper="{ placement: 'top', arrow: true }"
              >
                <span class="align-middle">
                  <UIcon name="i-bi-trophy" class="me-1 align-middle" />
                  <span class="align-middle">
                    {{ group.earnedGold }}
                  </span>
                </span>
              </UTooltip>
            </span>

            <span
              v-if="group.definedSilver"
              class="me-4 text-gray-500 dark:text-gray-300"
            >
              <UTooltip
                :text="`Out of ${group.definedSilver}`"
                class="align-middle"
                :popper="{ placement: 'top', arrow: true }"
              >
                <span class="align-middle">
                  <UIcon name="i-bi-trophy" class="me-1 align-middle" />
                  <span class="align-middle">
                    {{ group.earnedSilver }}
                  </span>
                </span>
              </UTooltip>
            </span>

            <span
              v-if="group.definedBronze"
              class="me-4 text-orange-600 dark:text-orange-500"
            >
              <UTooltip
                :text="`Out of ${group.definedBronze}`"
                class="align-middle"
                :popper="{ placement: 'top', arrow: true }"
              >
                <span class="align-middle">
                  <UIcon name="i-bi-trophy" class="me-1 align-middle" />
                  <span class="align-middle">
                    {{ group.earnedBronze }}
                  </span>
                </span>
              </UTooltip>
            </span>
          </div>

          <div class="flex flex-row justify-between">
            <span class="align-middle">
              <UIcon name="i-bi-p-circle-fill" class="me-2 align-middle" />
              <UTooltip
                text="Stream/total points"
                class="align-middle"
                :popper="{ placement: 'top', arrow: true }"
              >
                <span
                  v-if="Number(group.streamPoints)"
                  class="me-4 align-middle"
                >
                  {{
                    formatThousands(Number(group.streamPoints), {
                      separator: ",",
                    })
                  }}
                  /
                  {{
                    formatThousands(Number(group.points), {
                      separator: ",",
                    })
                  }}
                </span>

                <span v-else class="me-4 align-middle">
                  {{
                    formatThousands(Number(group.points), {
                      separator: ",",
                    })
                  }}
                </span>
              </UTooltip>
            </span>

            <span>
              <UTooltip
                :text="`${streamProgress}% on stream`"
                class="align-middle"
                :popper="{ placement: 'top', arrow: true }"
              >
                <span
                  :class="
                    group.progress === 100
                      ? streamProgress === 100
                        ? 'text-primary'
                        : 'text-green-600 dark:text-green-400'
                      : group.earnedPlatinum
                        ? 'text-sky-600 dark:text-sky-400'
                        : ''
                  "
                >
                  {{ group.progress }}%
                </span>
              </UTooltip>
            </span>
          </div>
        </div>

        <div>
          <UMeterGroup :min="0" :max="100" size="xs" :ui="{ list: 'hidden' }">
            <UMeter :value="streamProgress" color="primary" />
            <UMeter
              v-if="group.progress === 100"
              :value="group.progress - streamProgress"
              color="green"
            />

            <UMeter
              v-else-if="group.earnedPlatinum"
              :value="group.progress - streamProgress"
              color="sky"
            />

            <UMeter
              v-else
              :value="group.progress - streamProgress"
              color="gray"
            />
          </UMeterGroup>
        </div>
      </div>
    </figure>
  </NuxtLink>
</template>
