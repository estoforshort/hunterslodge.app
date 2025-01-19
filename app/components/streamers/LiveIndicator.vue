<script setup lang="ts">
import dayjs from "dayjs";

const props = defineProps<{
  id: number;
  userId: string;
}>();

const { data: streams } = await useFetch(`/api/profiles/${props.id}/streams`, {
  query: { pageSize: 1, orderBy: "createdAt", direction: "desc" },
  transform: (streams) => {
    return {
      data: streams.data.map((stream) => ({
        endsAt: stream.endsAt,
      })),
      page: streams.page,
      pageSize: streams.pageSize,
      totalSize: streams.totalSize,
    };
  },
});

const { data: user } = await useFetch(`/api/users/${props.userId}`, {
  transform: (user) => {
    if (!user.data) {
      return {
        data: null,
      };
    }

    return {
      data: {
        username: user.data.displayName,
      },
    };
  },
});
</script>

<template>
  <div
    v-if="streams?.data[0] && dayjs(streams.data[0].endsAt).isAfter(dayjs())"
  >
    <NuxtLink :to="`https://twitch.tv/${user?.data?.username}`" target="_blank">
      <UBadge size="sm" color="purple" variant="subtle" label="Watch now" />
    </NuxtLink>
  </div>
</template>
