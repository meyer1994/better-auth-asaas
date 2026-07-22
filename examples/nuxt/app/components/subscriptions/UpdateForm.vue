<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { updateSubscriptionSchema } from '@meyer1994/better-auth-asaas/zods'
import { z } from 'zod'

const emit = defineEmits<{ success: [] }>()

const { $auth } = useNuxtApp()
const toast = useToast()

const schema = updateSubscriptionSchema.extend({
  id: z.string().min(1, 'Required'),
})

const state = reactive<z.infer<typeof schema>>({
  id: '',
  description: '',
})
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="flex flex-col gap-4"
    @submit.prevent="async (e: FormSubmitEvent<z.infer<typeof schema>>) => {
      const { data, error } = await $auth.asaas.subscriptions.update({
        id: e.data.id,
        description: e.data.description || undefined,
      })

      if (error) toast.add({ title: 'Error', description: JSON.stringify(error), color: 'error' })
      if (data) {
        toast.add({ title: 'Subscription updated', description: JSON.stringify(data), color: 'success' })
        emit('success')
      }
    }"
  >
    <UCard>
      <template #title>
        <div class="flex items-center justify-between">
          Update subscription
          <UButton
            type="submit"
            icon="i-lucide-pencil"
            variant="ghost"
          />
        </div>
      </template>

      <div class="flex flex-col gap-3">
        <UFormField
          label="Subscription ID"
          name="id"
        >
          <UInput v-model="state.id" />
        </UFormField>
        <UFormField
          label="Description"
          name="description"
        >
          <UInput v-model="state.description" />
        </UFormField>
      </div>
    </UCard>
  </UForm>
</template>
