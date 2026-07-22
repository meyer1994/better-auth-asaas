<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { getSubscriptionQuerySchema } from '@meyer1994/better-auth-asaas/zods'
import { z } from 'zod'

const { $auth } = useNuxtApp()
const toast = useToast()

const schema = getSubscriptionQuerySchema.extend({
  id: z.string().min(1, 'Required'),
})

const state = reactive<z.infer<typeof schema>>({
  id: '',
})

const result = ref<unknown>(null)
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="flex flex-col gap-4"
    @submit.prevent="async (e: FormSubmitEvent<z.infer<typeof schema>>) => {
      const { data, error } = await $auth.asaas.subscriptions.get({
        query: { id: e.data.id },
      })

      if (error) {
        toast.add({ title: 'Error', description: JSON.stringify(error), color: 'error' })
        return
      }

      result = data
      toast.add({ title: 'Subscription loaded', color: 'success' })
    }"
  >
    <UCard>
      <template #title>
        <div class="flex items-center justify-between">
          Get subscription
          <UButton
            type="submit"
            icon="i-lucide-search"
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
        <pre
          v-if="result"
          class="overflow-x-auto text-xs"
        >{{ result }}</pre>
      </div>
    </UCard>
  </UForm>
</template>
