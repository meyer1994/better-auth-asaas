<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { updateSubscriptionCreditCardSchema } from '@meyer1994/better-auth-asaas/zods'
import { z } from 'zod'

const emit = defineEmits<{ success: [] }>()

const { $auth } = useNuxtApp()
const toast = useToast()

const schema = updateSubscriptionCreditCardSchema.safeExtend({
  id: z.string().min(1, 'Required'),
  creditCardToken: z.string().min(1, 'Required'),
  remoteIp: z.string().min(1),
})

const state = reactive<z.infer<typeof schema>>({
  id: '',
  creditCardToken: '',
  remoteIp: '127.0.0.1',
})
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="flex flex-col gap-4"
    @submit.prevent="async (e: FormSubmitEvent<z.infer<typeof schema>>) => {
      const { data, error } = await $auth.asaas.subscriptions.updateCreditCard({
        id: e.data.id,
        creditCardToken: e.data.creditCardToken,
        remoteIp: e.data.remoteIp,
      })

      if (error) toast.add({ title: 'Error', description: JSON.stringify(error), color: 'error' })
      if (data) {
        toast.add({ title: 'Subscription credit card updated', description: JSON.stringify(data), color: 'success' })
        emit('success')
      }
    }"
  >
    <UCard>
      <template #title>
        <div class="flex items-center justify-between">
          Update credit card
          <UButton
            type="submit"
            icon="i-lucide-credit-card"
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
          label="Credit card token"
          name="creditCardToken"
        >
          <UInput v-model="state.creditCardToken" />
        </UFormField>
        <UFormField
          label="Remote IP"
          name="remoteIp"
        >
          <UInput v-model="state.remoteIp" />
        </UFormField>
      </div>
    </UCard>
  </UForm>
</template>
