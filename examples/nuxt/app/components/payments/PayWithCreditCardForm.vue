<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

const emit = defineEmits<{ success: [] }>()

const { $auth } = useNuxtApp()
const toast = useToast()

const schema = z.object({
  id: z.string().min(1, 'Required'),
  creditCardToken: z.string().min(1, 'Required'),
})

const state = reactive<z.infer<typeof schema>>({
  id: '',
  creditCardToken: '',
})
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="flex flex-col gap-4"
    @submit.prevent="async (e: FormSubmitEvent<z.infer<typeof schema>>) => {
      const { data, error } = await $auth.asaas.payments.payWithCreditCard({
        id: e.data.id,
        creditCardToken: e.data.creditCardToken,
      })

      if (error) toast.add({ title: 'Error', description: JSON.stringify(error), color: 'error' })
      if (data) {
        toast.add({ title: 'Paid with credit card', description: JSON.stringify(data), color: 'success' })
        emit('success')
      }
    }"
  >
    <UCard>
      <template #title>
        <div class="flex items-center justify-between">
          Pay with credit card
          <UButton
            type="submit"
            icon="i-lucide-credit-card"
            variant="ghost"
          />
        </div>
      </template>

      <div class="flex flex-col gap-3">
        <UFormField
          label="Payment ID"
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
      </div>
    </UCard>
  </UForm>
</template>
