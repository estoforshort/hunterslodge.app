<script setup lang="ts">
import relativeTime from "dayjs/plugin/relativeTime";
import formatThousands from "format-thousands";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";

dayjs.extend(relativeTime);
dayjs.extend(duration);

const route = useRoute();
const page = ref(Number(route.query.page) ? Number(route.query.page) : 1);

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
  `/api/public/v1/profiles/${route.params.profile}/projects`,
  {
    query: { orderBy, direction, page, pageSize: 100 },
  },
);
</script>

<template>
  <div v-if="projects?.data" id="top">
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
      v-for="project in projects.data"
      :key="project.stack.id"
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
            <img
              :src="`/images/games/${project.stack.game.id}`"
              class="min-h-20 min-w-20 object-contain"
            />
          </div>
        </div>

        <div class="mx-2 my-2 flex-auto lg:my-auto">
          <div class="flex justify-between">
            <div>
              <UBadge
                v-for="platform in project.stack.game.platforms"
                :key="platform.platformId"
                color="gray"
                variant="solid"
                size="xs"
                class="me-1 align-middle"
                >{{ platform.platformId.toUpperCase() }}</UBadge
              >
              <span class="align-middle">{{ project.stack.game.name }}</span>
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
                    class="me-1 align-middle text-gray-600 lg:me-2"
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
                    <p>
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
                  <UIcon
                    name="i-bi-info-circle"
                    class="align-middle text-gray-600"
                  />
                </span>

                <template #panel>
                  <div class="p-2">
                    <p
                      v-if="project.progress !== 100"
                      class="text-sm font-light"
                    >
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

                    <p v-else class="text-sm font-light">
                      Completed in
                      {{
                        dayjs
                          .duration({
                            seconds:
                              dayjs(project.lastTrophyEarnedAt).unix() -
                              dayjs(project.firstTrophyEarnedAt).unix(),
                          })
                          .humanize()
                      }}
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
                v-if="project.stack.definedPlatinum"
                class="me-4 text-sky-500 dark:text-sky-300"
              >
                <UIcon name="i-bi-trophy" class="me-1 align-middle" />
                <span class="align-middle">
                  {{ project.earnedPlatinum }}
                </span>
              </span>

              <span
                v-if="project.stack.definedGold"
                class="me-4 text-yellow-600 dark:text-yellow-400"
              >
                <UTooltip
                  :text="`Out of ${project.stack.definedGold}`"
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
                v-if="project.stack.definedSilver"
                class="me-4 text-gray-500 dark:text-gray-300"
              >
                <UTooltip
                  :text="`Out of ${project.stack.definedSilver}`"
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
                v-if="project.stack.definedBronze"
                class="me-4 text-orange-600 dark:text-orange-500"
              >
                <UTooltip
                  :text="`Out of ${project.stack.definedBronze}`"
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
                <span class="me-4 align-middle">{{
                  formatThousands(Number(project.points), { separator: "," })
                }}</span>
              </span>

              <span v-if="project.progress >= project.stack.avgProgress">
                <UTooltip
                  :text="`${project.progress - project.stack.avgProgress}% above average`"
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
                  :text="`${project.stack.avgProgress - project.progress}% below average`"
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
                project.progress >= project.stack.avgProgress
                  ? 'green'
                  : 'yellow'
              "
              size="xs"
            />
          </div>
        </div>
      </figure>
    </div>

    <template v-if="projects.totalSize > projects.pageSize">
      <div class="mt-6 flex justify-center">
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
    </template>
  </div>
</template>
