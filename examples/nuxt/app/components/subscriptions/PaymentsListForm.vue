<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import type { Payment } from 'better-auth-asaas/types'
import { z } from 'zod'

const { $auth } = useNuxtApp()
const toast = useToast()

const statusOptions = [
  'PENDING',
  'RECEIVED',
  'CONFIRMED',
  'OVERDUE',
  'REFUNDED',
  'RECEIVED_IN_CASH',
  'REFUND_REQUESTED',
  'REFUND_IN_PROGRESS',
  'CHARGEBACK_REQUESTED',
  'CHARGEBACK_DISPUTE',
  'AWAITING_CHARGEBACK_REVERSAL',
  'DUNNING_REQUESTED',
  'DUNNING_RECEIVED',
  'AWAITING_RISK_ANALYSIS',
] as const

const schema = z.object({
  id: z.string().min(1, 'Required'),
  status: z.enum(statusOptions).optional(),
})

const state = reactive<{ id: string, status?: typeof statusOptions[number] | undefined }>({
  id: '',
  status: undefined,
})

const payments = ref<Payment[]>([])
const loading = ref(false)

const columns: TableColumn<Payment>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'value', header: 'Value' },
  { accessorKey: 'dueDate', header: 'Due date' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'billingType', header: 'Billing type' },
]
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="flex flex-col gap-4"
    @submit.prevent="async (e: FormSubmitEvent<z.infer<typeof schema>>) => {
      loading = true
      try {
        const { data, error } = await $auth.asaas.subscriptions.payments({
          query: {
            id: e.data.id,
            ...(e.data.status ? { status: e.data.status } : {}),
          },
        })

        if (error) {
          toast.add({ title: 'Error', description: JSON.stringify(error), color: 'error' })
          return
        }

        payments = data?.data ?? []
        toast.add({ title: 'Subscription payments loaded', color: 'success' })
      }
      finally {
        loading = false
      }
    }"
  >
    <UCard>
      <template #title>
        <div class="flex items-center justify-between">
          List subscription payments
          <UButton
            type="submit"
            icon="i-lucide-search"
            variant="ghost"
            :loading="loading"
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
          label="Status (optional)"
          name="status"
        >
          <USelect
            v-model="state.status"
            :items="[...statusOptions]"
            placeholder="Any"
          />
        </UFormField>

        <UTable
          v-if="payments.length"
          :columns="columns"
          :data="payments"
        />
        <pre
          v-else-if="!loading"
          class="text-xs text-muted"
        >No payments loaded</pre>
      </div>
    </UCard>
  </UForm>
</template>
