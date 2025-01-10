<script setup lang="ts">
const props = defineProps<{
  userId: string;
  regionId: string;
}>();

const { data: user } = await useFetch(`/api/public/v1/users/${props.userId}`, {
  transform: (user) => {
    if (!user.data) {
      return null;
    }

    return {
      id: user.data.id,
      displayName: user.data.displayName,
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
    <UTooltip :text="user.isFounder ? 'Founder' : ''" :popper="{ arrow: true }">
      <UChip
        color="yellow"
        position="top-left"
        text="F"
        size="xl"
        :show="user.isFounder"
      >
        <div
          class="bg-cool-200 dark:bg-cool-800 rounded"
          :class="
            user.isFounder
              ? 'border-2 border-yellow-500 dark:border-yellow-400'
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
