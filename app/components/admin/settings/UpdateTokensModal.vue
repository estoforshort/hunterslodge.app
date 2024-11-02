<script setup lang="ts">
import { z } from "zod";

const emit = defineEmits(["success"]);

const modal = useModal();
const toast = useToast();

const schema = z.object({
  npsso: z.string().min(1),
});

const body = reactive({
  npsso: undefined,
});

const loading = ref(false);

async function onSubmit() {
  loading.value = true;

  try {
    await $fetch("/api/app-tokens", {
      method: "PUT",
      body,
    });

    toast.add({
      description: `Tokens successfully updated`,
      color: "green",
    });

    emit("success");

    loading.value = false;
    return await modal.close();
  } catch (e) {
    console.error(e);

    toast.add({
      description: `Successfully failed to update tokens`,
      color: "red",
    });

    loading.value = false;
    return await modal.close();
  }
}
</script>

<template>
  <UModal prevent-close>
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3
            class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
          >
            Update tokens
          </h3>

          <UButton
            icon="i-heroicons-x-mark-20-solid"
            color="gray"
            variant="ghost"
            class="-my-1"
            @click="modal.close"
          />
        </div>
      </template>

      <UForm :schema :state="body" class="space-y-4" @submit="onSubmit">
        <UFormGroup name="npsso">
          <UInput v-model="body.npsso" placeholder="NPSSO" />
        </UFormGroup>

        <UButton
          type="submit"
          color="gray"
          size="sm"
          :loading
          :disabled="loading"
        >
          Update
        </UButton>
      </UForm>
    </UCard>
  </UModal>
</template>
