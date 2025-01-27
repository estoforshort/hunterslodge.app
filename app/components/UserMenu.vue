<script setup lang="ts">
import LinkPsnModal from "./LinkPsnModal.vue";

const { user, clear, fetch } = useUserSession();

const modal = useModal();

function openLinkPsnModal() {
  modal.open(LinkPsnModal, {
    onSuccess() {
      fetch();
    },
  });
}

const queueing = ref(false);
const toast = useToast();

async function queueUpdate() {
  if (queueing.value === false) {
    queueing.value = true;

    try {
      const response = await $fetch("/api/updates", { method: "POST" });

      toast.add({
        description: response.data.message,
        color: response.data.success ? "green" : "red",
        actions: [
          {
            color: "gray",
            size: "xs",
            label: "View updates",
            click: () => navigateTo(`/hunters/${user.value?.username}/updates`),
          },
        ],
      });

      queueing.value = false;
    } catch (e) {
      console.error(e);
      queueing.value = false;
    }
  }
}

const items = computed(() => [
  [
    {
      label: "User",
      slot: "user",
      disabled: true,
    },
  ],
  [
    {
      label: "Link PSN",
      icon: "i-bi-link-45deg",
      click: openLinkPsnModal,
      class: user.value?.profileId === null ? "" : "hidden",
    },
    {
      label: "Queue update",
      icon: "i-bi-arrow-repeat",
      click: queueUpdate,
      class: user.value?.profileId === null ? "hidden" : "",
    },
  ],
  [
    {
      label: "My profile",
      icon: "i-bi-person",
      to: `/hunters/${user.value?.username}`,
      class: user.value?.profileId === null ? "hidden" : "",
    },
    {
      label: "Settings",
      icon: "i-bi-gear",
      to: "/settings",
    },
  ],
  [
    {
      label: "Administrate",
      icon: "i-bi-lightning-charge",
      to: "/admin",
      class: user.value?.isAdmin ? "" : "hidden",
    },
    {
      label: "Log out",
      icon: "i-bi-box-arrow-right",
      click: clear,
    },
  ],
]);
</script>

<template>
  <div>
    <UButton
      v-if="!user"
      label="Log in"
      to="/login"
      color="white"
      variant="solid"
      external
    >
      <template #trailing>
        <UIcon name="i-simple-icons-twitch" class="h-4 w-4" />
      </template>
    </UButton>

    <UDropdown
      v-else
      :items
      :ui="{ item: { disabled: 'cursor-text select-text' } }"
      :popper="{ placement: 'bottom-end' }"
      class="align-middle"
    >
      <UAvatar :src="`/api/hunters/${user.username}/images/twitch`" size="md" />

      <template #user="{}">
        <div class="text-left">
          <p>Logged in as</p>
          <p class="truncate font-medium text-gray-900 dark:text-white">
            {{ user?.displayName }}
          </p>
        </div>
      </template>

      <template #item="{ item }">
        <span class="truncate">{{ item.label }}</span>

        <UIcon
          :name="item.icon"
          class="ms-auto h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500"
        />
      </template>
    </UDropdown>
  </div>
</template>
