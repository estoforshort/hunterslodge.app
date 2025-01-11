<script setup lang="ts">
const props = defineProps<{
  userId: string;
  regionId: string;
  streamerPoints: number;
}>();

const { data: user } = await useFetch(`/api/public/v1/users/${props.userId}`, {
  transform: (user) => {
    if (!user.data) {
      return null;
    }

    return {
      id: user.data.id,
      displayName: user.data.displayName,
      isAdimin: user.data.isAdmin,
      isFounder: user.data.isFounder,
      profileId: user.data.profile?.id,
    };
  },
});

const { data: region } = await useFetch(
  `/api/public/v1/profile-regions/${props.regionId}`,
  {
    transform: (region) => {
      if (!region.data) {
        return null;
      }

      return {
        id: region.data.id,
        name: region.data.name,
      };
    },
  },
);

const config = useRuntimeConfig();
</script>

<template>
  <div v-if="user && region" class="flex items-center gap-3">
    <UTooltip
      :text="
        user.isAdimin
          ? 'Administrator'
          : user.isFounder
            ? 'Founder'
            : streamerPoints > 0
              ? 'Streamer'
              : ''
      "
      :popper="{ arrow: true }"
    >
      <UChip
        :color="
          user.isAdimin
            ? 'red'
            : user.isFounder
              ? 'yellow'
              : streamerPoints > 0
                ? 'primary'
                : 'gray'
        "
        position="top-left"
        :text="
          user.isAdimin
            ? 'A'
            : user.isFounder
              ? 'F'
              : streamerPoints > 0
                ? 'S'
                : ''
        "
        size="xl"
        :show="user.isAdimin || user.isFounder || streamerPoints > 0"
      >
        <div
          class="bg-cool-200 dark:bg-cool-800 rounded"
          :class="
            user.isAdimin
              ? 'border-2 border-red-500 dark:border-red-400'
              : user.isFounder
                ? 'border-2 border-yellow-500 dark:border-yellow-400'
                : streamerPoints > 0
                  ? 'border-primary dark:border-primary border-2'
                  : ''
          "
        >
          <NuxtLink :to="`/hunters/${user.profileId}`">
            <NuxtImg
              :src="`${config.public.baseUrl}/images/users/${user.id}`"
              width="48"
              class="max-h-12 min-h-12 min-w-12 max-w-12 rounded object-contain"
              placeholder
            />
          </NuxtLink>
        </div>
      </UChip>
    </UTooltip>

    <span>
      <span class="font-semibold">
        <NuxtLink :to="`/hunters/${user.profileId}`">
          {{ user.displayName }}
        </NuxtLink>
      </span>
      <br />
      <span>
        <UBadge color="gray" variant="solid" size="sm" class="align-middle">
          <UIcon :name="`i-circle-flags-${region.id}`" />
          {{ region.name }}
        </UBadge>
      </span>
    </span>
  </div>
</template>
