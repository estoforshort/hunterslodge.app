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

const { data: updates } = await useFetch(
  `/api/hunters/${route.params.hunter}/updates`,
  {
    query: { orderBy: "createdAt", direction: "desc", page, pageSize },
    transform: (updates) => {
      return {
        data: updates.data.map((update) => ({
          id: update.id,
          status: update.status,
          type: update.type,
          fullUpdate: update.fullUpdate,
          progress: update.progress,
          finishedAt: update.finishedAt,
          startedProjectsFrom: update.startedProjectsFrom,
          startedProjectsTo: update.startedProjectsTo,
          completedProjectsFrom: update.completedProjectsFrom,
          completedProjectsTo: update.completedProjectsTo,
          earnedPlatinumFrom: update.earnedPlatinumFrom,
          earnedPlatinumTo: update.earnedPlatinumTo,
          earnedGoldFrom: update.earnedGoldFrom,
          earnedGoldTo: update.earnedGoldTo,
          earnedSilverFrom: update.earnedSilverFrom,
          earnedSilverTo: update.earnedSilverTo,
          earnedBronzeFrom: update.earnedBronzeFrom,
          earnedBronzeTo: update.earnedBronzeTo,
          completionFrom: update.completionFrom,
          completionTo: update.completionTo,
          pointsFrom: update.pointsFrom,
          pointsTo: update.pointsTo,
          createdAt: update.createdAt,
        })),
        page: updates.page,
        pageSize: updates.pageSize,
        totalSize: updates.totalSize,
      };
    },
  },
);
</script>

<template>
  <div id="top">
    <UCard
      v-for="update in updates?.data"
      :key="update.id"
      class="mb-6 last:mb-0"
    >
      <template #header>
        <div class="flex justify-between">
          <p class="font-bold">Update No. {{ update.id }}</p>

          <div>
            <UBadge variant="subtle" :label="update.type" class="me-2" />

            <UBadge
              v-if="update.status === 'WAITING'"
              color="gray"
              variant="subtle"
              >{{ update.status }}</UBadge
            >
            <UBadge
              v-else-if="update.status === 'RUNNING'"
              color="yellow"
              variant="subtle"
              >{{ update.status }}</UBadge
            >
            <UBadge
              v-else-if="update.status === 'SUCCESSFUL'"
              color="green"
              variant="subtle"
              >{{ update.status }}</UBadge
            >
            <UBadge
              v-else-if="update.status === 'FAILED'"
              color="red"
              variant="subtle"
              >{{ update.status }}</UBadge
            >
          </div>
        </div>
      </template>

      <UProgress :value="update.progress" indicator />

      <div v-if="update.status === 'SUCCESSFUL'">
        <p class="mt-4">
          <span
            v-if="update.earnedPlatinumTo - update.earnedPlatinumFrom !== 0"
            class="me-4 text-sky-500 dark:text-sky-300"
          >
            <UIcon name="i-bi-trophy" class="me-1 align-middle" />
            <span class="align-middle"
              >+{{
                formatThousands(
                  update.earnedPlatinumTo - update.earnedPlatinumFrom,
                  { separator: "," },
                )
              }}</span
            >
          </span>

          <span
            v-if="update.earnedGoldTo - update.earnedGoldFrom !== 0"
            class="me-4 text-yellow-600 dark:text-yellow-400"
          >
            <UIcon name="i-bi-trophy" class="me-1 align-middle" />
            <span class="align-middle"
              >+{{
                formatThousands(update.earnedGoldTo - update.earnedGoldFrom, {
                  separator: ",",
                })
              }}</span
            >
          </span>

          <span
            v-if="update.earnedSilverTo - update.earnedSilverFrom !== 0"
            class="me-4 text-gray-500 dark:text-gray-300"
          >
            <UIcon name="i-bi-trophy" class="me-1 align-middle" />
            <span class="align-middle"
              >+{{
                formatThousands(
                  update.earnedSilverTo - update.earnedSilverFrom,
                  { separator: "," },
                )
              }}</span
            >
          </span>

          <span
            v-if="update.earnedBronzeTo - update.earnedBronzeFrom !== 0"
            class="text-orange-600 dark:text-orange-500"
          >
            <UIcon name="i-bi-trophy" class="me-1 align-middle" />
            <span class="align-middle"
              >+{{
                formatThousands(
                  update.earnedBronzeTo - update.earnedBronzeFrom,
                  { separator: "," },
                )
              }}</span
            >
          </span>
        </p>

        <p class="mt-4">
          <span
            v-if="update.startedProjectsTo - update.startedProjectsFrom !== 0"
          >
            <span class="font-semibold">New projects:</span>
            <span
              v-if="update.startedProjectsTo - update.startedProjectsFrom < 0"
              class="font-mono text-red-500"
            >
              <span>
                &nbsp;{{
                  formatThousands(
                    update.startedProjectsTo - update.startedProjectsFrom,
                    { separator: "," },
                  )
                }}
              </span>
              <br />
            </span>

            <span
              v-else-if="
                update.startedProjectsTo - update.startedProjectsFrom <=
                update.completedProjectsTo - update.completedProjectsFrom
              "
              class="font-mono text-green-500"
            >
              <span>
                &nbsp;+{{
                  formatThousands(
                    update.startedProjectsTo - update.startedProjectsFrom,
                    { separator: "," },
                  )
                }}
              </span>
              <br />
            </span>

            <span v-else class="font-mono text-yellow-500">
              <span>
                &nbsp;+{{
                  formatThousands(
                    update.startedProjectsTo - update.startedProjectsFrom,
                    { separator: "," },
                  )
                }}
              </span>
              <br />
            </span>
          </span>

          <span
            v-if="
              update.completedProjectsTo - update.completedProjectsFrom !== 0
            "
          >
            <span class="font-semibold">Completions:</span>
            <span
              v-if="
                update.completedProjectsTo - update.completedProjectsFrom > 0
              "
              class="font-mono text-green-500"
            >
              <span>
                &nbsp;+{{
                  formatThousands(
                    update.completedProjectsTo - update.completedProjectsFrom,
                    { separator: "," },
                  )
                }}
              </span>
              <br />
            </span>

            <span v-else class="font-mono text-red-500">
              <span>
                &nbsp;{{
                  formatThousands(
                    update.completedProjectsTo - update.completedProjectsFrom,
                    { separator: "," },
                  )
                }}
              </span>
              <br />
            </span>
          </span>

          <span class="font-semibold">Completion:</span>
          <span
            v-if="
              Number(update.completionTo) - Number(update.completionFrom) > 0
            "
            class="font-mono text-green-500"
          >
            <span>
              &nbsp;+{{
                Math.round(
                  (Number(update.completionTo) -
                    Number(update.completionFrom) +
                    Number.EPSILON) *
                    100,
                ) / 100
              }}%
            </span>
            <br />
          </span>

          <span
            v-else-if="
              Number(update.completionTo) - Number(update.completionFrom) < 0
            "
            class="font-mono text-red-500"
          >
            <span>
              &nbsp;{{
                Math.round(
                  (Number(update.completionTo) -
                    Number(update.completionFrom) +
                    Number.EPSILON) *
                    100,
                ) / 100
              }}%
            </span>
            <br />
          </span>

          <span v-else class="font-mono">
            <span>
              &nbsp;{{
                Math.round(
                  (Number(update.completionTo) -
                    Number(update.completionFrom) +
                    Number.EPSILON) *
                    100,
                ) / 100
              }}%
            </span>
            <br />
          </span>

          <span class="font-semibold">Points:</span>
          <span
            v-if="Number(update.pointsTo) - Number(update.pointsFrom) > 0"
            class="font-mono text-green-500"
          >
            <span>
              &nbsp;+{{
                formatThousands(
                  Math.round(
                    (Number(update.pointsTo) -
                      Number(update.pointsFrom) +
                      Number.EPSILON) *
                      100,
                  ) / 100,
                  { separator: "," },
                )
              }}
            </span>
          </span>

          <span
            v-else-if="Number(update.pointsTo) - Number(update.pointsFrom) < 0"
            class="font-mono text-red-500"
          >
            <span>
              &nbsp;{{
                formatThousands(
                  Math.round(
                    (Number(update.pointsTo) -
                      Number(update.pointsFrom) +
                      Number.EPSILON) *
                      100,
                  ) / 100,
                  { separator: "," },
                )
              }}
            </span>
          </span>

          <span v-else class="font-mono">
            <span>
              &nbsp;{{
                formatThousands(
                  Math.round(
                    (Number(update.pointsTo) -
                      Number(update.pointsFrom) +
                      Number.EPSILON) *
                      100,
                  ) / 100,
                  { separator: "," },
                )
              }}
            </span>
          </span>
        </p>
      </div>

      <template #footer>
        <div class="justify-between lg:flex">
          <div v-if="update.status === 'WAITING'" class="text-sm">
            Queued
            {{
              dayjs
                .duration({
                  seconds: dayjs().unix() - dayjs(update.createdAt).unix(),
                })
                .humanize()
            }}
            ago
          </div>

          <div v-else-if="update.status === 'RUNNING'" class="text-sm">
            Started
            {{
              dayjs
                .duration({
                  seconds: dayjs().unix() - dayjs(update.createdAt).unix(),
                })
                .humanize()
            }}
            ago
          </div>

          <div v-else class="me-2 text-sm">
            Finished
            {{
              dayjs
                .duration({
                  seconds: dayjs().unix() - dayjs(update.finishedAt).unix(),
                })
                .humanize()
            }}
            ago

            <span v-if="update.status === 'SUCCESSFUL'">
              <span class="mx-3">•</span>
              <span>
                Took
                {{
                  dayjs
                    .duration({
                      seconds:
                        dayjs(update.finishedAt).unix() -
                        dayjs(update.createdAt).unix(),
                    })
                    .humanize()
                }}
              </span>
            </span>
          </div>
        </div>
      </template>
    </UCard>

    <div
      v-if="updates && updates.totalSize > updates.pageSize"
      class="mt-6 flex justify-center"
    >
      <UPagination
        v-model="page"
        :page-count="updates.pageSize"
        :total="updates.totalSize"
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
