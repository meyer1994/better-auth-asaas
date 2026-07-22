<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { createPaymentWithCreditCardSchema } from '@meyer1994/better-auth-asaas/zods'
import { z } from 'zod'

const emit = defineEmits<{ success: [] }>()

const { $auth } = useNuxtApp()
const toast = useToast()

const schema = createPaymentWithCreditCardSchema.safeExtend({
  value: z.number().positive('Must be > 0'),
  dueDate: z.iso.date(),
  creditCardToken: z.string().min(1, 'Required'),
  remoteIp: z.string().min(1),
})

const state = reactive<z.infer<typeof schema>>({
  value: 100,
  dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  description: 'Test credit card payment',
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
      const { data, error } = await $auth.asaas.payments.createCreditCard({
        value: e.data.value,
        dueDate: e.data.dueDate,
        description: e.data.description,
        creditCardToken: e.data.creditCardToken,
        remoteIp: e.data.remoteIp,
      })

      if (error) toast.add({ title: 'Error', description: JSON.stringify(error), color: 'error' })
      if (data) {
        toast.add({ title: 'Credit card payment created', description: JSON.stringify(data), color: 'success' })
        emit('success')
      }
    }"
  >
    <UCard>
      <template #title>
        <div class="flex items-center justify-between">
          Create credit card payment
          <UButton
            type="submit"
            icon="i-lucide-plus"
            variant="ghost"
          />
        </div>
      </template>

      <div class="flex flex-col gap-3">
        <UFormField
          label="Value"
          name="value"
        >
          <UInput
            v-model="state.value"
            type="number"
            step="1"
          />
        </UFormField>
        <UFormField
          label="Due date"
          name="dueDate"
        >
          <UInput
            v-model="state.dueDate"
            type="date"
          />
        </UFormField>
        <UFormField
          label="Description"
          name="description"
        >
          <UInput v-model="state.description" />
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
