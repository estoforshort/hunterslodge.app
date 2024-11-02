<script setup lang="ts">
const { user, clear } = useUserSession();

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
      label: "Administrate",
      icon: "i-heroicons-bolt",
      to: "/p/admin",
      class: user.value?.isAdmin ? "" : "hidden",
    },
    {
      label: "Log out",
      icon: "i-heroicons-arrow-left-on-rectangle",
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
      <UAvatar :src="`/images/users/${user.id}`" size="md" />

      <template #user="{}">
        <div class="text-left">
          <p>Signed in as</p>
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
