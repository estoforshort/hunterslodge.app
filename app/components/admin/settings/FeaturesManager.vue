<script setup lang="ts">
const { data: settings } = await useFetch("/api/app/settings");

const features = reactive({
  overlaysEnabled: settings.value?.data.overlaysEnabled,
  linkingEnabled: settings.value?.data.linkingEnabled,
  updatesEnabled: settings.value?.data.updatesEnabled,
});

const toast = useToast();
const updatingFeatures = ref(false);

async function updateFeatures() {
  try {
    updatingFeatures.value = true;

    await $fetch("/api/app/settings", {
      method: "PUT",
      body: features,
    });

    toast.add({
      description: "Features successfully updated",
      color: "green",
    });

    updatingFeatures.value = false;
  } catch (e) {
    console.error(e);

    features.overlaysEnabled = settings.value?.data.overlaysEnabled;
    features.linkingEnabled = settings.value?.data.linkingEnabled;
    features.updatesEnabled = settings.value?.data.updatesEnabled;

    toast.add({
      description: "Successfully failed to update the features",
      color: "red",
    });

    updatingFeatures.value = false;
  }
}
</script>

<template>
  <UDashboardSection
    title="Features"
    description="Manage features"
    orientation="horizontal"
    class="px-4 py-6"
  >
    <UCard
      :ui="{
        body: {
          base: 'divide-y divide-gray-200 dark:divide-gray-800 gap-4 flex flex-col',
        },
      }"
    >
      <UFormGroup
        key="overlays"
        name="overlays"
        label="Overlays"
        description="Enable or disable overlays"
        :ui="{ container: 'flex' }"
        class="flex items-center justify-between gap-2 pt-4 first:pt-0"
      >
        <UToggle
          v-model="features.overlaysEnabled"
          size="md"
          :disabled="updatingFeatures"
          @update:model-value="updateFeatures"
        />
      </UFormGroup>

      <UFormGroup
        key="linking"
        name="linking"
        label="Linking"
        description="Enable or disable linking"
        :ui="{ container: 'flex' }"
        class="flex items-center justify-between gap-2 pt-4 first:pt-0"
      >
        <UToggle
          v-model="features.linkingEnabled"
          size="md"
          :disabled="updatingFeatures || !features.updatesEnabled"
          @update:model-value="updateFeatures"
        />
      </UFormGroup>

      <UFormGroup
        key="updates"
        name="updates"
        label="Updates"
        description="Enable or disable updates"
        :ui="{ container: 'flex' }"
        class="flex items-center justify-between gap-2 pt-4 first:pt-0"
      >
        <UToggle
          v-model="features.updatesEnabled"
          size="md"
          :disabled="updatingFeatures || features.linkingEnabled"
          @update:model-value="updateFeatures"
        />
      </UFormGroup>
    </UCard>
  </UDashboardSection>
</template>
