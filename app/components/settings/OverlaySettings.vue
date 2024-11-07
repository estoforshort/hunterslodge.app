<script setup lang="ts">
const { user } = useUserSession();

const { data: overlay, refresh } = await useFetch("/api/overlay");

const { data: projects } = await useFetch(
  `/api/public/v1/profiles/${user.value?.username}/projects`,
);

const config = useRuntimeConfig();

const overlayUrl = ref(`${config.public.baseUrl}/o/${overlay.value?.data?.id}`);

const loading = ref(false);
const toast = useToast();

async function getNewOverlay() {
  try {
    loading.value = true;

    const newOverlay = await $fetch("/api/overlay", {
      method: "POST",
    });

    await refresh();

    overlayUrl.value = `${config.public.baseUrl}/o/${overlay.value?.data?.id}`;

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

const project = ref(projects.value?.data[0]);

if (overlay.value?.data?.project) {
  project.value = projects.value?.data.find(
    (p) => p.stack.id === overlay.value?.data?.project?.stack.id,
  );
}

async function updateOverlay() {
  try {
    loading.value = true;

    await $fetch("/api/overlay", {
      method: "PUT",
      body: {
        stackId: project.value?.stack.id,
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
      <div v-if="!user?.isLinked">
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

          <div v-if="projects?.data" class="pt-4">
            <USelectMenu
              v-model="project"
              :options="projects.data"
              searchable
              searchable-placeholder="Search a project..."
              :search-attributes="['stack.game.name']"
              clear-search-on-close
              :disabled="!showProject || automaticProjectUpdates || loading"
              @update:model-value="updateOverlay"
            >
              <template #label>
                {{ project?.stack.game.name }}
              </template>
              <template #option="{ option }">
                {{ option.stack.game.name }}
              </template>
            </USelectMenu>
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
