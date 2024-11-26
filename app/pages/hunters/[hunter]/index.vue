<script setup lang="ts">
import relativeTime from "dayjs/plugin/relativeTime";
import formatThousands from "format-thousands";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";

dayjs.extend(relativeTime);
dayjs.extend(duration);

const route = useRoute();
const page = ref(Number(route.query.page) ? Number(route.query.page) : 1);
const pageSize = 100;

const orderOptions = [
  {
    name: "Order by last trophy",
    value: "lastTrophyEarnedAt",
  },
  {
    name: "Order by first trophy",
    value: "firstTrophyEarnedAt",
  },
  {
    name: "Order by progress",
    value: "progress",
  },
  {
    name: "Order by points",
    value: "points",
  },
  {
    name: "Order by stream points",
    value: "streamPoints",
  },
  {
    name: "Order by time streamed",
    value: "timeStreamed",
  },
];

const directionOptions = [
  {
    name: "Descending",
    value: "desc",
  },
  {
    name: "Ascending",
    value: "asc",
  },
];

const orderBy = ref("lastTrophyEarnedAt");
const direction = ref("desc");

const { data: projects } = await useFetch(
  `/api/public/v1/profiles/${route.params.hunter}/projects`,
  {
    query: { orderBy, direction, page, pageSize },
    transform: (projects) => {
      return {
        data: projects.data.map((project) => ({
          gameId: project.stack.game.id,
          stackId: project.stack.id,
          name: project.stack.game.name,
          platforms: project.stack.game.platforms,
          definedPlatinum: project.stack.definedPlatinum,
          definedGold: project.stack.definedGold,
          definedSilver: project.stack.definedSilver,
          definedBronze: project.stack.definedBronze,
          earnedPlatinum: project.earnedPlatinum,
          earnedGold: project.earnedGold,
          earnedSilver: project.earnedSilver,
          earnedBronze: project.earnedBronze,
          firstTrophyEarnedAt: project.firstTrophyEarnedAt,
          lastTrophyEarnedAt: project.lastTrophyEarnedAt,
          avgProgress: project.stack.avgProgress,
          progress: project.progress,
          points: project.points,
          streamPoints: project.streamPoints,
          timeStreamed: project.timeStreamed,
        })),
        page: projects.page,
        pageSize: projects.pageSize,
        totalSize: projects.totalSize,
      };
    },
  },
);

const config = useRuntimeConfig();
</script>

<template>
  <div id="top">
    <div class="mb-6 grid grid-cols-2 gap-6">
      <USelect
        v-model="orderBy"
        :options="orderOptions"
        option-attribute="name"
      >
        <template #trailing>
          <UIcon name="i-heroicons-arrows-up-down-20-solid" class="h-5 w-5" />
        </template>
      </USelect>

      <USelect
        v-model="direction"
        :options="directionOptions"
        option-attribute="name"
      >
        <template #trailing>
          <UIcon name="i-heroicons-arrows-up-down-20-solid" class="h-5 w-5" />
        </template>
      </USelect>
    </div>

    <div
      v-for="project in projects?.data"
      :key="project.stackId"
      class="mb-3 last:mb-0"
    >
      <figure
        class="flex rounded-lg border-e-8 bg-gradient-to-r from-white via-white to-gray-200 shadow-lg dark:from-gray-900 dark:via-slate-950 dark:to-slate-950"
        :class="
          project.progress === 100
            ? 'border-green-600 dark:border-green-400'
            : project.earnedPlatinum
              ? 'border-sky-600 dark:border-sky-400'
              : 'border-gray-200 dark:border-slate-950'
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

              <span v-if="project.progress >= project.avgProgress">
                <UTooltip
                  :text="`${project.progress - project.avgProgress}% above average`"
                  class="align-middle"
                  :popper="{ placement: 'top', arrow: true }"
                >
                  <span class="text-green-600 dark:text-green-400">
                    {{ project.progress }}%
                  </span>
                </UTooltip>
              </span>

              <span v-else>
                <UTooltip
                  :text="`${project.avgProgress - project.progress}% below average`"
                  class="align-middle"
                  :popper="{ placement: 'top', arrow: true }"
                >
                  <span class="text-yellow-600 dark:text-yellow-400">
                    {{ project.progress }}%
                  </span>
                </UTooltip>
              </span>
            </div>
          </div>

          <div>
            <UProgress
              :value="project.progress"
              :color="
                project.progress >= project.avgProgress ? 'green' : 'yellow'
              "
              size="xs"
            />
          </div>
        </div>
      </figure>
    </div>

    <div
      v-if="projects && projects.totalSize > projects.pageSize"
      class="mt-6 flex justify-center"
    >
      <UPagination
        v-model="page"
        :page-count="projects.pageSize"
        :total="projects.totalSize"
        :to="
          (page: number) => ({
            query: { page },
            hash: '#top',
          })
        "
        show-first
        show-last
      />
    </div>
  </div>
</template>
