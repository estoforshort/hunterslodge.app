<script setup lang="ts">
import { z } from "zod";

const emit = defineEmits(["success"]);

const modal = useModal();
const toast = useToast();

const schema = z.object({
  onlineId: z.string().min(3).max(16),
});

const body = reactive({
  onlineId: undefined,
});

const loading = ref(false);

async function onSubmit() {
  loading.value = true;

  try {
    const linkPsn = await $fetch("/api/profiles", {
      method: "POST",
      body,
    });

    toast.add({
      description: linkPsn.data.message,
      color: linkPsn.data.success ? "green" : "red",
    });

    if (linkPsn.data.success) emit("success");

    loading.value = false;
    return await modal.close();
  } catch (e) {
    console.error(e);

    toast.add({
      description: "Successfully failed to link your PSN",
      color: "red",
    });

    loading.value = false;
    return await modal.close();
  }
}

const { user } = useUserSession();
</script>

<template>
  <UModal prevent-close>
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3
            class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
          >
            Link PSN
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
        <UFormGroup
          name="onlineId"
          :description="`Before proceeding with the linking process, please make sure to change your About me on PSN temporarily to link:${user?.username}. You can change it back once we are done here.`"
        >
          <UInput v-model="body.onlineId" placeholder="PSN Username" />
        </UFormGroup>

        <UButton
          type="submit"
          color="gray"
          size="sm"
          :loading
          :disabled="loading"
        >
          Link
        </UButton>
      </UForm>
    </UCard>
  </UModal>
</template>
