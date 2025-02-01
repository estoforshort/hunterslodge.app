<script setup lang="ts">
import AddShadow from "~/components/admin/shadows/AddShadow.vue";
import formatThousands from "format-thousands";

definePageMeta({
  middleware: "admin",
});

const route = useRoute();
const page = ref(Number(route.query.page) ? Number(route.query.page) : 1);
const pageSize = 50;

const { data: hunters, refresh } = await useFetch("/api/hunters/shadow", {
  query: { page, pageSize },
  transform: (hunters) => {
    return {
      data: hunters.data.map((hunter) => ({
        region: hunter.region,
        onlineId: hunter.onlineId,
        earnedPlatinum: hunter.earnedPlatinum,
        earnedGold: hunter.earnedGold,
        earnedSilver: hunter.earnedSilver,
        earnedBronze: hunter.earnedBronze,
        points: formatThousands(hunter.points, ","),
      })),
      page: hunters.page,
      pageSize: hunters.pageSize,
      totalSize: hunters.totalSize,
    };
  },
});

const columns = [
  {
    key: "position",
    label: "#",
  },
  {
    key: "hunter",
    label: "Hunter",
  },
  {
    key: "earnedPlatinum",
    label: "Platinum",
  },
  {
    key: "earnedGold",
    label: "Gold",
  },
  {
    key: "earnedSilver",
    label: "Silver",
  },
  {
    key: "earnedBronze",
    label: "Bronze",
  },
  {
    key: "points",
    label: "Points",
  },
  {
    key: "actions",
    label: "",
  },
];

const modal = useModal();

function openLinkPsnModal() {
  modal.open(AddShadow, {
    onSuccess() {
      refresh();
    },
  });
}

const queueing = ref(false);
const toast = useToast();

async function queueUpdate(onlineId: string) {
  if (queueing.value === false) {
    queueing.value = true;

    try {
      const response = await $fetch(`/api/hunters/shadow/${onlineId}/update`, {
        method: "POST",
      });

      toast.add({
        description: response.data.message,
        color: response.data.success ? "green" : "red",
      });

      queueing.value = false;
    } catch (e) {
      console.error(e);
      queueing.value = false;
    }
  }
}

const config = useRuntimeConfig();
</script>

<template>
  <UPage>
    <UPageBody>
      <div class="flex justify-end">
        <UButton color="white" size="xs" @click="openLinkPsnModal">
          Add new
        </UButton>
      </div>

      <UTable v-if="hunters" :columns="columns" :rows="hunters.data">
        <template #position-data="{ row }">
          {{
            ordinal(
              page * pageSize -
                pageSize +
                hunters.data.findIndex((i) => i.onlineId === row.onlineId) +
                1,
            )
          }}
        </template>

        <template #hunter-data="{ row }">
          <div class="flex items-center gap-3">
            <div class="bg-cool-200 dark:bg-cool-800 rounded">
              <NuxtImg
                :src="`${config.public.baseUrl}/api/hunters/shadow/${row.onlineId}/image`"
                width="48"
                class="max-h-12 min-h-12 min-w-12 max-w-12 rounded object-contain"
                placeholder
              />
            </div>

            <span>
              <span class="font-semibold">
                {{ row.onlineId }}
              </span>
              <br />
              <span>
                <UBadge
                  color="gray"
                  variant="solid"
                  size="sm"
                  class="align-middle"
                >
                  <UIcon :name="`i-circle-flags-${row.region.id}`" />
                  {{ row.region.name }}
                </UBadge>
              </span>
            </span>
          </div>
        </template>

        <template #earnedPlatinum-data="{ row }">
          <span class="text-sky-500 dark:text-sky-300">
            {{ formatThousands(row.earnedPlatinum, ",") }}
          </span>
        </template>

        <template #earnedGold-data="{ row }">
          <span class="text-yellow-600 dark:text-yellow-400">
            {{ formatThousands(row.earnedGold, ",") }}
          </span>
        </template>

        <template #earnedSilver-data="{ row }">
          <span class="text-gray-500 dark:text-gray-300">
            {{ formatThousands(row.earnedSilver, ",") }}
          </span>
        </template>

        <template #earnedBronze-data="{ row }">
          <span class="text-orange-600 dark:text-orange-500">
            {{ formatThousands(row.earnedBronze, ",") }}
          </span>
        </template>

        <template #actions-data="{ row }">
          <UButton
            color="white"
            size="xs"
            :loading="queueing"
            @click="queueUpdate(row.onlineId)"
          >
            Update
          </UButton>
        </template>
      </UTable>

      <div
        v-if="hunters && hunters.totalSize > hunters.pageSize"
        class="flex justify-center border-t border-gray-200 px-3 py-3.5 dark:border-gray-700"
      >
        <UPagination
          v-model="page"
          :page-count="hunters.pageSize"
          :total="hunters.totalSize"
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
    </UPageBody>
  </UPage>
</template>
