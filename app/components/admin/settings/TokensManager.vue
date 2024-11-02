<script setup lang="ts">
import UpdateTokensModal from "./UpdateTokensModal.vue";

const { data: tokens, refresh } = await useFetch("/api/app-tokens");

const modal = useModal();

function openUpdateTokensModal() {
  modal.open(UpdateTokensModal, {
    onSuccess() {
      refresh();
    },
  });
}
</script>

<template>
  <UDashboardSection
    title="Tokens"
    description="Manage tokens"
    orientation="horizontal"
    class="px-4 py-6"
  >
    <UCard>
      <div class="justify-between gap-2 lg:flex">
        <div class="mb-2 lg:mb-0">
          <UBadge
            v-if="!tokens?.data.refreshTokenExpiresAt"
            size="md"
            color="red"
            variant="outline"
          >
            <strong class="me-1">RT:</strong> Not set
          </UBadge>

          <UBadge
            v-else-if="
              dayjs().isAfter(dayjs(tokens.data.refreshTokenExpiresAt))
            "
            size="md"
            color="yellow"
            variant="outline"
          >
            <strong class="me-1">RT:</strong> Expired
          </UBadge>

          <UBadge v-else size="md" color="green" variant="outline">
            <strong class="me-1">RT:</strong> Expires in
            {{
              dayjs
                .duration({
                  seconds:
                    dayjs(tokens.data.refreshTokenExpiresAt).unix() -
                    dayjs().unix(),
                })
                .humanize()
            }}
          </UBadge>
        </div>

        <div class="mb-2 lg:mb-0">
          <UBadge
            v-if="!tokens?.data.expiresAt"
            size="md"
            color="red"
            variant="outline"
          >
            <strong class="me-1">AT:</strong> Not set
          </UBadge>

          <UBadge
            v-else-if="dayjs().isAfter(dayjs(tokens.data.expiresAt))"
            size="md"
            color="yellow"
            variant="outline"
          >
            <strong class="me-1">AT:</strong> Expired
          </UBadge>

          <UBadge v-else size="md" color="green" variant="outline">
            <strong class="me-1">AT:</strong> Expires in
            {{
              dayjs
                .duration({
                  seconds: dayjs(tokens.data.expiresAt).unix() - dayjs().unix(),
                })
                .humanize()
            }}
          </UBadge>
        </div>

        <div v-if="tokens?.data.updatedAt" class="mb-2 lg:mb-0">
          <UBadge size="md" color="gray">
            <strong class="me-1">Updated:</strong>
            {{
              dayjs
                .duration({
                  seconds: dayjs().unix() - dayjs(tokens.data.updatedAt).unix(),
                })
                .humanize()
            }}
            ago
          </UBadge>
        </div>

        <div>
          <UButton
            icon="i-heroicons-arrow-path"
            size="xs"
            class="rounded-full"
            @click="openUpdateTokensModal"
          />
        </div>
      </div>
    </UCard>
  </UDashboardSection>
</template>
