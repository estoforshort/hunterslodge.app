<script setup lang="ts">
const { data: overlay, refresh } = await useFetch("/api/me/overlay");

const { user } = useUserSession();

const { data: projects } = await useFetch(
  `/api/hunters/${user.value?.username}/projects`,
  {
    transform: (projects) => {
      return projects.data.map((project) => ({
        id: project.stack.id,
        name: project.stack.game.name,
      }));
    },
  },
);

const config = useRuntimeConfig();

const overlayUrl = ref(
  `${config.public.baseUrl}/overlays/${overlay.value?.data?.id}`,
);

const loading = ref(false);
const toast = useToast();

async function getNewOverlay() {
  try {
    loading.value = true;

    const newOverlay = await $fetch("/api/overlays", {
      method: "POST",
    });

    await refresh();

    overlayUrl.value = `${config.public.baseUrl}/overlays/${overlay.value?.data?.id}`;

    toast.add({
      description: newOverlay.data.message,
      color: newOverlay.data.success ? "green" : "red",
    });

    loading.value = false;
  } catch (e) {
    console.error(e);

    toast.add({
      description: `Successfully failed to get the new URL`,
      color: "red",
    });

    loading.value = false;
  }
}

const automaticTrophyUpdates = ref(overlay.value?.data?.updateTrophies ?? true);
const showProject = ref(overlay.value?.data?.showProject ?? false);
const automaticProjectUpdates = ref(
  overlay.value?.data?.updateProject ?? false,
);

const project = ref(projects.value ? projects.value[0] : null);

if (overlay.value?.data?.project) {
  project.value = projects.value?.find(
    (p) => p.id === overlay.value?.data?.project?.stack.id,
  );
}

const styles = [
  {
    id: "default",
    label: "Default style",
  },
  {
    id: "streamer",
    label: "Streamers leaderboard",
  },
];

const style = ref(
  overlay.value?.data
    ? styles.find((s) => s.id === overlay.value?.data?.style)
    : styles[0],
);

async function updateOverlay() {
  try {
    loading.value = true;

    await $fetch("/api/me/overlay", {
      method: "PUT",
      body: {
        stackId: project.value?.id,
        style: style.value?.id,
        showProject: showProject.value,
        updateProject: automaticProjectUpdates.value,
        updateTrophies: automaticTrophyUpdates.value,
      },
    });

    await refresh();

    toast.add({
      description: "Overlay successfully updated",
      color: "green",
    });

    loading.value = false;
  } catch (e) {
    console.error(e);

    toast.add({
      description: `Successfully failed to update the overlay`,
      color: "red",
    });

    loading.value = false;
  }
}
</script>

<template>
  <UDashboardSection
    title="Overlay"
    description="Manage your stream overlay"
    orientation="horizontal"
    class="px-4 py-6"
  >
    <UCard>
      <div v-if="!user?.profileId">
        You need to link your PSN to use this feature.
      </div>

      <div v-else>
        <div v-if="overlay?.data">
          <div class="flex items-center justify-between gap-2">
            <span>Automatic trophy updates</span>
            <UToggle
              v-model="automaticTrophyUpdates"
              size="md"
              :disabled="loading"
              @update:model-value="updateOverlay"
            />
          </div>

          <div class="flex items-center justify-between gap-2 pt-2">
            <span>Show project</span>
            <UToggle
              v-model="showProject"
              size="md"
              :disabled="loading"
              @update:model-value="updateOverlay"
            />
          </div>

          <div class="flex items-center justify-between gap-2 pt-2">
            <span>Automatic project changes</span>
            <UToggle
              v-model="automaticProjectUpdates"
              size="md"
              :disabled="!showProject || loading"
              @update:model-value="updateOverlay"
            />
          </div>

          <div v-if="projects && project" class="pt-4">
            <USelectMenu
              v-model="project"
              :options="projects"
              searchable
              searchable-placeholder="Search a project..."
              :search-attributes="['name']"
              clear-search-on-close
              :disabled="!showProject || automaticProjectUpdates || loading"
              @update:model-value="updateOverlay"
            >
              <template #label>
                {{ project?.name }}
              </template>
              <template #option="{ option }">
                {{ option.name }}
              </template>
            </USelectMenu>
          </div>

          <div class="pt-4">
            <USelectMenu
              v-model="style"
              :options="styles"
              option-attribute="label"
              :disabled="loading"
              @update:model-value="updateOverlay"
            />
          </div>

          <div class="pt-4">
            <UInput v-model="overlayUrl" readonly />
          </div>

          <div class="pt-2">
            <UButton
              color="gray"
              :loading
              :disabled="loading"
              @click="getNewOverlay"
            >
              Get new overlay URL
            </UButton>
          </div>
        </div>

        <div v-else>
          <UButton
            color="gray"
            :loading
            :disabled="loading"
            @click="getNewOverlay"
          >
            Get the overlay URL
          </UButton>
        </div>
      </div>
    </UCard>
  </UDashboardSection>
</template>
