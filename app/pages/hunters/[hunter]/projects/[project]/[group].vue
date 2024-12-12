<script setup lang="ts">
import relativeTime from "dayjs/plugin/relativeTime";
import formatThousands from "format-thousands";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";

dayjs.extend(relativeTime);
dayjs.extend(duration);

const route = useRoute();

const { data: project } = await useFetch(
  `/api/public/v1/profiles/${route.params.hunter}/projects/${route.params.project}`,
);

const { data: groups } = await useFetch(
  `/api/public/v1/profiles/${route.params.hunter}/projects/${route.params.project}/groups`,
  {
    transform: (groups) => {
      return {
        data: groups.data.map((group) => ({
          groupId: group.stackGroup.gameGroup.id,
          name: group.stackGroup.gameGroup.name,
        })),
      };
    },
  },
);

const group = groups.value?.data.find((g) => g.groupId === route.params.group);

const { data: stackTrophies } = await useFetch(
  `/api/public/v1/stacks/${route.params.project}/groups/${route.params.group}/trophies`,
);

const { data: projectTrophies } = await useFetch(
  `/api/public/v1/profiles/${route.params.hunter}/projects/${route.params.project}/groups/${route.params.group}/trophies`,
);

function isEarned(id: number) {
  const earned = projectTrophies.value?.data.find(
    (trophy) => trophy.stackTrophy.gameTrophy.id === id,
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
      class="mb-2 flex rounded-e-lg shadow-lg last:mb-0"
      :class="
        isEarned(trophy.gameTrophy.id)
          ? useTrophyBackground(trophy.gameTrophy.type)
          : useTrophyBackground(trophy.gameTrophy.type) +
            ' opacity-40 hover:opacity-100 dark:opacity-20 dark:hover:opacity-100'
      "
    >
      <img
        :src="`${config.public.baseUrl}/images/games/${trophy.gameId}/${trophy.groupId}/${trophy.trophyId}`"
        class="mb-auto min-h-20 min-w-20 max-w-20 justify-start object-contain"
      />

      <div class="mx-2 my-auto flex-auto">
        <div class="flex flex-col justify-between sm:flex-row">
          <p class="text-left font-semibold">{{ trophy.gameTrophy.name }}</p>

          <div class="flex">
            <p class="me-3 align-middle">
              <UTooltip
                text="Quality"
                class="align-middle"
                :popper="{ placement: 'left', arrow: true }"
              >
                <span class="align-middle">
                  <UIcon name="i-bi-award-fill" class="me-1 align-middle" />
                  <span class="align-middle"> {{ trophy.quality }}% </span>
                </span>
              </UTooltip>
            </p>

            <p class="me-3 align-middle">
              <UTooltip
                text="Rarity ratio"
                class="align-middle"
                :popper="{ placement: 'left', arrow: true }"
              >
                <span class="align-middle">
                  <UIcon name="i-bi-r-circle-fill" class="me-1 align-middle" />
                  <span class="align-middle">{{ trophy.rarity }}</span>
                </span>
              </UTooltip>
            </p>

            <p class="align-middle">
              <UTooltip
                text="Points"
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

            <p
              v-if="isEarned(trophy.trophyId)?.streamId"
              class="ms-3 align-middle"
            >
              <UTooltip
                text="Earned on stream"
                class="align-middle"
                :popper="{ placement: 'left', arrow: true }"
              >
                <span class="align-middle">
                  <UIcon
                    name="i-bi-camera-reels-fill"
                    class="text-primary align-middle"
                  />
                  <span class="align-middle"></span>
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
