<script setup lang="ts">
import relativeTime from "dayjs/plugin/relativeTime";
import formatThousands from "format-thousands";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";

dayjs.extend(relativeTime);
dayjs.extend(duration);

const route = useRoute();

const { data: project } = await useFetch(
  `/api/hunters/${route.params.hunter}/projects/${route.params.project}/summary`,
);

const { data: groups } = await useFetch(
  `/api/hunters/${route.params.hunter}/projects/${route.params.project}/groups`,
  {
    transform: (groups) => {
      return {
        data: groups.data.map((group) => ({
          groupId: group.stackGroup.groupId,
          name: group.stackGroup.gameGroup.name,
        })),
      };
    },
  },
);

const group = groups.value?.data.find((g) => g.groupId === route.params.group);

const { data: stackTrophies } = await useFetch(
  `/api/games/${route.params.project}/groups/${route.params.group}/trophies`,
);

const { data: projectTrophies } = await useFetch(
  `/api/hunters/${route.params.hunter}/projects/${route.params.project}/groups/${route.params.group}/trophies`,
);

function isEarned(id: number) {
  const earned = projectTrophies.value?.data.find(
    (trophy) => trophy.stackTrophy.trophyId === id,
  );

  if (earned) {
    return earned;
  } else {
    return null;
  }
}

const breadcrumb = computed(() => [
  {
    label: "Projects",
    to: `/hunters/${route.params.hunter}/projects`,
  },
]);

if (groups.value?.data.length === 1) {
  breadcrumb.value.push({
    label: project.value?.data?.stack.game.name ?? "",
    to: ``,
  });
} else {
  breadcrumb.value.push(
    {
      label: project.value?.data?.stack.game.name ?? "",
      to: `/hunters/${route.params.hunter}/projects/${route.params.project}`,
    },
    {
      label: group?.name ?? "",
      to: ``,
    },
  );
}

const config = useRuntimeConfig();
</script>

<template>
  <div>
    <UBreadcrumb :links="breadcrumb" class="mb-6" />

    <figure
      v-for="trophy in stackTrophies?.data"
      :key="trophy.trophyId"
      class="mb-2 flex rounded-e-lg bg-gradient-to-r from-white via-white shadow-lg last:mb-0"
      :class="
        isEarned(trophy.trophyId)
          ? trophy.gameTrophy.type === 'platinum'
            ? isEarned(trophy.trophyId)?.streamId
              ? 'border-primary border-e-8 to-sky-400 dark:from-gray-900 dark:via-slate-950 dark:to-sky-600'
              : 'to-sky-400 dark:from-gray-900 dark:via-slate-950 dark:to-sky-600'
            : trophy.gameTrophy.type === 'gold'
              ? isEarned(trophy.trophyId)?.streamId
                ? 'border-primary border-e-8 to-yellow-400 dark:from-gray-900 dark:via-slate-950 dark:to-yellow-600'
                : 'to-yellow-400 dark:from-gray-900 dark:via-slate-950 dark:to-yellow-600'
              : trophy.gameTrophy.type === 'silver'
                ? isEarned(trophy.trophyId)?.streamId
                  ? 'to-cool-400 border-primary border-e-8 dark:from-gray-900 dark:via-slate-950 dark:to-slate-600'
                  : 'to-cool-400 dark:from-gray-900 dark:via-slate-950 dark:to-slate-600'
                : isEarned(trophy.trophyId)?.streamId
                  ? 'border-primary border-e-8 to-orange-400 dark:from-gray-900 dark:via-slate-950 dark:to-orange-800'
                  : 'to-orange-400 dark:from-gray-900 dark:via-slate-950 dark:to-orange-800'
          : trophy.gameTrophy.type === 'platinum'
            ? 'to-sky-400 opacity-40 hover:opacity-100 dark:from-gray-900 dark:via-slate-950 dark:to-sky-600 dark:opacity-20 dark:hover:opacity-100'
            : trophy.gameTrophy.type === 'gold'
              ? 'to-yellow-400 opacity-40 hover:opacity-100 dark:from-gray-900 dark:via-slate-950 dark:to-yellow-600 dark:opacity-20 dark:hover:opacity-100'
              : trophy.gameTrophy.type === 'silver'
                ? 'to-cool-400 opacity-40 hover:opacity-100 dark:from-gray-900 dark:via-slate-950 dark:to-slate-600 dark:opacity-20 dark:hover:opacity-100'
                : 'to-orange-400 opacity-40 hover:opacity-100 dark:from-gray-900 dark:via-slate-950 dark:to-orange-800 dark:opacity-20 dark:hover:opacity-100'
      "
    >
      <NuxtImg
        :src="`${config.public.baseUrl}/images/games/${trophy.gameId}/${trophy.groupId}/${trophy.trophyId}`"
        width="80"
        class="mb-auto min-h-20 min-w-20 max-w-20 justify-start object-contain"
        placeholder
      />

      <div class="mx-2 my-auto flex-auto">
        <div class="flex flex-col justify-between sm:flex-row">
          <p class="text-left font-semibold">{{ trophy.gameTrophy.name }}</p>

          <div class="flex">
            <p class="me-3 align-middle">
              <UTooltip
                :text="`Earned by ${trophy.timesEarned} ${trophy.timesEarned === 1 ? 'hunter' : 'hunters'}`"
                class="align-middle"
                :popper="{ placement: 'left', arrow: true }"
              >
                <span class="align-middle">
                  <UIcon
                    name="i-bi-check-circle-fill"
                    class="me-1 align-middle"
                  />
                  <span class="align-middle">{{ trophy.rarity }}%</span>
                </span>
              </UTooltip>
            </p>

            <p class="align-middle">
              <UTooltip
                :text="`${trophy.quality}% quality`"
                class="align-middle"
                :popper="{ placement: 'left', arrow: true }"
              >
                <span class="align-middle">
                  <UIcon name="i-bi-p-circle-fill" class="me-1 align-middle" />
                  <span class="align-middle">{{
                    formatThousands(
                      isEarned(trophy.trophyId)?.points ?? trophy.value,
                      ",",
                    )
                  }}</span>
                </span>
              </UTooltip>
            </p>
          </div>
        </div>

        <p>{{ trophy.gameTrophy.description }}</p>
        <p v-if="isEarned(trophy.trophyId)" class="mt-2 text-xs font-semibold">
          Earned
          {{
            dayjs
              .duration({
                seconds:
                  dayjs().unix() -
                  dayjs(isEarned(trophy.trophyId)?.earnedAt).unix(),
              })
              .humanize()
          }}
          ago
        </p>
      </div>
    </figure>
  </div>
</template>
