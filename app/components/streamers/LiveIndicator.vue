<script setup lang="ts">
import dayjs from "dayjs";

const props = defineProps<{
  id: number;
  username: string;
}>();

const { data: streams } = await useFetch(
  `/api/public/v1/profiles/${props.id}/streams`,
  {
    query: { pageSize: 1, orderBy: "createdAt", direction: "desc" },
    transform: (streams) => {
      return {
        data: streams.data.map((stream) => ({
          endsAt: stream.endsAt,
        })),
      };
    },
  },
);
</script>

<template>
  <div
    v-if="streams?.data[0] && dayjs(streams.data[0].endsAt).isAfter(dayjs())"
  >
    <NuxtLink :to="`https://twitch.tv/${username}`" target="_blank">
      <UBadge size="sm" color="purple" variant="subtle" label="Watch now" />
    </NuxtLink>
  </div>
</template>
