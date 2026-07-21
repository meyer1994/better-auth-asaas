<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

const emit = defineEmits<{ success: [] }>()

const { $auth } = useNuxtApp()
const toast = useToast()

const schema = z.object({
  value: z.number().positive('Must be > 0'),
  nextDueDate: z.iso.date(),
  cycle: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'YEARLY']).default('MONTHLY'),
  description: z.string().optional(),
  creditCardToken: z.string().min(1, 'Required'),
  remoteIp: z.string().min(1),
})

const state = reactive<z.infer<typeof schema>>({
  value: 100,
  nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  cycle: 'MONTHLY',
  description: 'Test credit card subscription',
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
      const { data, error } = await $auth.asaas.subscriptions.createCreditCard({
        value: e.data.value,
        nextDueDate: e.data.nextDueDate,
        cycle: e.data.cycle,
        description: e.data.description,
        creditCardToken: e.data.creditCardToken,
        remoteIp: e.data.remoteIp,
      })

      if (error) toast.add({ title: 'Error', description: JSON.stringify(error), color: 'error' })
      if (data) {
        toast.add({ title: 'Credit card subscription created', description: JSON.stringify(data), color: 'success' })
        emit('success')
      }
    }"
  >
    <UCard>
      <template #title>
        <div class="flex items-center justify-between">
          Create credit card subscription
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
          label="Next due date"
          name="nextDueDate"
        >
          <UInput
            v-model="state.nextDueDate"
            type="date"
          />
        </UFormField>
        <UFormField
          label="Cycle"
          name="cycle"
        >
          <USelect
            v-model="state.cycle"
            :items="['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'YEARLY']"
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
