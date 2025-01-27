<script setup lang="ts">
import { UButton } from "#components";
import dayjs from "dayjs";

const props = defineProps<{
  username: string;
}>();

const { data: streams } = await useFetch(
  `/api/hunters/${props.username}/streams`,
  {
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
  },
);
</script>

<template>
  <div
    v-if="streams?.data[0] && dayjs(streams.data[0].endsAt).isAfter(dayjs())"
  >
    <UButton
      :to="`https://twitch.tv/${props.username}`"
      target="_blank"
      label="Live now"
      color="primary"
      variant="outline"
      size="xs"
    />
  </div>
</template>
