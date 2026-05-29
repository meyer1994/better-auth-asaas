<script setup lang="ts">
import { z } from 'zod'
import { useAuth } from '~/composables/auth'
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import type { Page, Payment } from 'better-auth-asaas/types'

const auth = useAuth()
const toast = useToast()

const schema = z.object({
  value: z.number().positive('Must be > 0'),
  dueDate: z.iso.date(),
  billingType: z.enum(['PIX', 'BOLETO', 'CREDIT_CARD', 'UNDEFINED']).default('PIX'),
  description: z.string().optional(),
})

const state = reactive<z.infer<typeof schema>>({
  value: 100,
  dueDate: '2026-06-20',
  billingType: 'PIX',
  description: 'Test payment',
})

const [
  { data: session, refresh: refreshSession, status: sessionStatus, error: sessionError },
  { data: payments, refresh: refreshPayments, status: paymentsStatus, error: paymentsError },
] = await Promise.all([
  useSession(),
  usePayments(),
])
</script>

<template>
  <div class="grid grid-cols-2 gap-4 w-full">
    <div class="flex flex-col gap-4">
      <!-- form card -->
      <UForm
        :schema="schema"
        :state="state"
        class="flex flex-col gap-4"
        @submit.prevent="async (e: FormSubmitEvent<z.infer<typeof schema>>) => {
          const { data, error } = await auth.asaas.payments.create({
            value: e.data.value,
            dueDate: e.data.dueDate,
            billingType: e.data.billingType,
            description: e.data.description,
          })
          if (error) toast.add({ title: 'Error', description: JSON.stringify(error), color: 'error' })
          if (data) toast.add({ title: 'Payment created', description: JSON.stringify(data), color: 'success' })
          if (data) await refreshPayments()
        }"
      >
        <UCard>
          <template #title>
            <div class="flex items-center justify-between">
              Create payment
              <UButton
                type="submit"
                icon="i-lucide-plus"
                variant="ghost"
              />
            </div>
          </template>

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
            label="Billing type"
            name="billingType"
          >
            <USelect
              v-model="state.billingType"
              default-value="PIX"
              :items="['PIX', 'BOLETO', 'CREDIT_CARD', 'UNDEFINED']"
            />
          </UFormField>
          <UFormField
            label="Description"
            name="description"
          >
            <UInput v-model="state.description" />
          </UFormField>
        </UCard>
      </UForm>

      <!-- session card -->
      <UCard class="overflow-x-auto">
        <template #title>
          <div class="flex items-center justify-between">
            Session
            <UButton
              icon="i-lucide-refresh-cw"
              variant="ghost"
              @click="() => refreshSession()"
            />
          </div>
        </template>

        <pre v-if="sessionStatus === 'success'">{{ session }}</pre>
        <pre v-if="paymentsStatus === 'error'">{{ paymentsError }}</pre>
        <pre v-if="paymentsStatus === 'pending'">Loading...</pre>
      </UCard>
    </div>

    <!-- payments card -->
    <UCard>
      <template #title>
        <div class="flex items-center justify-between">
          Payments
          <UButton
            icon="i-lucide-refresh-cw"
            variant="ghost"
            @click="() => refreshPayments()"
          />
        </div>
      </template>

      <UTable
        :loading="paymentsStatus === 'pending'"
        :data="payments?.data ?? []"
      />
    </UCard>
  </div>
</template>
