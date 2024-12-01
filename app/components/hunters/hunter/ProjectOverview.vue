<script setup lang="ts">
import relativeTime from "dayjs/plugin/relativeTime";
import formatThousands from "format-thousands";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";

dayjs.extend(relativeTime);
dayjs.extend(duration);

const props = defineProps<{
  project: {
    gameId: number;
    stackId: string;
    name: string;
    platforms: {
      platformId: string;
    }[];
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
    avgProgress: number;
    progress: number;
    points: string;
    streamPoints: string;
    timeStreamed: number;
  };
}>();

const config = useRuntimeConfig();

const definedGoldPoints = props.project.definedGold * 90;
const definedSilverPoints = props.project.definedSilver * 30;
const definedBronzePoints = props.project.definedBronze * 15;

const earnedStreamGoldPoints = props.project.streamGold * 90;
const earnedStreamSilverPoints = props.project.streamSilver * 30;
const earnedStreamBronzePoints = props.project.streamBronze * 15;

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
</script>

<template>
  <figure
    class="flex rounded-lg border-e-8 bg-gradient-to-r from-white via-white to-gray-200 shadow-lg dark:from-gray-900 dark:via-slate-950 dark:to-slate-950"
    :class="
      project.progress === 100
        ? streamProgress === 100
          ? 'border-primary'
          : 'border-green-500 dark:border-green-400'
        : streamProgress === project.progress
          ? 'border-primary'
          : project.earnedPlatinum
            ? 'border-sky-500 dark:border-sky-400'
            : 'border-gray-200 dark:border-gray-950'
    "
  >
    <div class="flex bg-gray-200 dark:bg-gray-800">
      <div class="my-auto max-w-20">
        <NuxtImg
          :src="`${config.public.baseUrl}/images/games/${project.gameId}`"
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
            v-for="platform in project.platforms"
            :key="platform.platformId"
            color="gray"
            variant="solid"
            size="xs"
            class="me-1 align-middle"
            >{{ platform.platformId.toUpperCase() }}</UBadge
          >
          <span class="align-middle">{{ project.name }}</span>
        </div>

        <div class="flex">
          <UPopover
            v-if="project.timeStreamed"
            mode="hover"
            :popper="{ placement: 'auto' }"
          >
            <span class="me-2 align-middle">
              <UIcon
                name="i-bi-clock-history"
                class="me-1 align-middle lg:me-2"
              />
              <span class="hidden align-middle lg:me-2 lg:inline-block">
                {{
                  dayjs
                    .duration(project.timeStreamed, "seconds")
                    .format("HH:mm")
                }}
              </span>
            </span>

            <template #panel>
              <div class="p-2">
                <p class="text-sm">
                  Time streamed:
                  {{
                    dayjs
                      .duration(project.timeStreamed, "seconds")
                      .format("HH:mm")
                  }}
                </p>
              </div>
            </template>
          </UPopover>

          <UPopover mode="hover" :popper="{ placement: 'auto' }">
            <span class="align-middle">
              <UIcon name="i-bi-info-circle" class="align-middle" />
            </span>

            <template #panel>
              <div class="p-2">
                <p v-if="project.progress !== 100" class="text-sm">
                  Started
                  {{
                    dayjs
                      .duration({
                        seconds:
                          dayjs().unix() -
                          dayjs(project.firstTrophyEarnedAt).unix(),
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
                          dayjs(project.lastTrophyEarnedAt).unix() -
                          dayjs(project.firstTrophyEarnedAt).unix(),
                      })
                      .humanize()
                  }},
                  {{
                    dayjs
                      .duration({
                        seconds:
                          dayjs().unix() -
                          dayjs(project.lastTrophyEarnedAt).unix(),
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
            v-if="project.definedPlatinum"
            class="me-4 text-sky-500 dark:text-sky-300"
          >
            <UTooltip
              :text="`Out of ${project.definedPlatinum}`"
              class="align-middle"
              :popper="{ placement: 'top', arrow: true }"
            >
              <span class="align-middle">
                <UIcon name="i-bi-trophy" class="me-1 align-middle" />
                <span class="align-middle">
                  {{ project.earnedPlatinum }}
                </span>
              </span>
            </UTooltip>
          </span>

          <span
            v-if="project.definedGold"
            class="me-4 text-yellow-600 dark:text-yellow-400"
          >
            <UTooltip
              :text="`Out of ${project.definedGold}`"
              class="align-middle"
              :popper="{ placement: 'top', arrow: true }"
            >
              <span class="align-middle">
                <UIcon name="i-bi-trophy" class="me-1 align-middle" />
                <span class="align-middle">
                  {{ project.earnedGold }}
                </span>
              </span>
            </UTooltip>
          </span>

          <span
            v-if="project.definedSilver"
            class="me-4 text-gray-500 dark:text-gray-300"
          >
            <UTooltip
              :text="`Out of ${project.definedSilver}`"
              class="align-middle"
              :popper="{ placement: 'top', arrow: true }"
            >
              <span class="align-middle">
                <UIcon name="i-bi-trophy" class="me-1 align-middle" />
                <span class="align-middle">
                  {{ project.earnedSilver }}
                </span>
              </span>
            </UTooltip>
          </span>

          <span
            v-if="project.definedBronze"
            class="me-4 text-orange-600 dark:text-orange-500"
          >
            <UTooltip
              :text="`Out of ${project.definedBronze}`"
              class="align-middle"
              :popper="{ placement: 'top', arrow: true }"
            >
              <span class="align-middle">
                <UIcon name="i-bi-trophy" class="me-1 align-middle" />
                <span class="align-middle">
                  {{ project.earnedBronze }}
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
                v-if="Number(project.streamPoints)"
                class="me-4 align-middle"
              >
                {{
                  formatThousands(Number(project.streamPoints), {
                    separator: ",",
                  })
                }}
                /
                {{
                  formatThousands(Number(project.points), {
                    separator: ",",
                  })
                }}
              </span>

              <span v-else class="me-4 align-middle">
                {{
                  formatThousands(Number(project.points), {
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
                  project.progress === 100
                    ? streamProgress === 100
                      ? 'text-primary'
                      : 'text-green-600 dark:text-green-400'
                    : streamProgress === project.progress
                      ? 'text-primary'
                      : project.earnedPlatinum
                        ? 'text-sky-600 dark:text-sky-400'
                        : ''
                "
              >
                {{ project.progress }}%
              </span>
            </UTooltip>
          </span>
        </div>
      </div>

      <div>
        <UMeterGroup :min="0" :max="100" size="xs" :ui="{ list: 'hidden' }">
          <UMeter :value="streamProgress" color="primary" />
          <UMeter
            v-if="project.progress === 100"
            :value="project.progress - streamProgress"
            color="green"
          />

          <UMeter
            v-else-if="project.earnedPlatinum"
            :value="project.progress - streamProgress"
            color="sky"
          />

          <UMeter
            v-else
            :value="project.progress - streamProgress"
            color="gray"
          />
        </UMeterGroup>
      </div>
    </div>
  </figure>
</template>
