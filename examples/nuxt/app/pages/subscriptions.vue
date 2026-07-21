<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import type { Subscription } from '@meyer1994/better-auth-asaas/types'
import { z } from 'zod'

const { $auth } = useNuxtApp()
const toast = useToast()

const schema = z.object({
  value: z.number().positive('Must be > 0'),
  nextDueDate: z.iso.date(),
  cycle: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'YEARLY']).default('MONTHLY'),
  billingType: z.enum(['UNDEFINED', 'BOLETO', 'CREDIT_CARD', 'PIX']).default('PIX'),
  description: z.string().optional(),
})

const state = reactive<z.infer<typeof schema>>({
  value: 100,
  nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string,
  cycle: 'MONTHLY',
  billingType: 'PIX',
  description: 'Test subscription',
})

const columns: TableColumn<Subscription>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'value', header: 'Value' },
  { accessorKey: 'nextDueDate', header: 'Next due date' },
  { accessorKey: 'cycle', header: 'Cycle' },
  { accessorKey: 'billingType', header: 'Billing type' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'description', header: 'Description' },
]

const [
  { data: session, refresh: refreshSession, status: sessionStatus },
  { data: subscriptions, refresh: refreshSubscriptions, status: subscriptionsStatus, error: subscriptionsError },
] = await Promise.all([
  $auth.useSession(),
  useSubscriptions(),
])

if (!session.value) await navigateTo('/login', { replace: true })
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
          if (!session?.user?.asaasCustomerId) {
            toast.add({ title: 'Error', description: 'User does not have an Asaas customer ID', color: 'error' })
            return
          }

          const { data, error } = await $auth.asaas.subscriptions.create({
            value: e.data.value,
            nextDueDate: e.data.nextDueDate,
            cycle: e.data.cycle,
            billingType: e.data.billingType,
            description: e.data.description,
          })

          if (error) toast.add({ title: 'Error', description: JSON.stringify(error), color: 'error' })
          if (data) toast.add({ title: 'Subscription created', description: JSON.stringify(data), color: 'success' })
          if (data) await refreshSubscriptions()
        }"
      >
        <UCard>
          <template #title>
            <div class="flex items-center justify-between">
              Create subscription
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
            label="Billing type"
            name="billingType"
          >
            <USelect
              v-model="state.billingType"
              :items="['UNDEFINED', 'BOLETO', 'CREDIT_CARD', 'PIX']"
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

      <SubscriptionsCreateCreditCardForm @success="() => refreshSubscriptions()" />
      <SubscriptionsGetForm />
      <SubscriptionsUpdateForm @success="() => refreshSubscriptions()" />
      <SubscriptionsUpdateCreditCardForm @success="() => refreshSubscriptions()" />
      <SubscriptionsDeleteForm @success="() => refreshSubscriptions()" />
      <SubscriptionsPaymentsListForm />
      <SubscriptionsPaymentBookForm />

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
        <pre v-if="subscriptionsStatus === 'error'">{{ subscriptionsError }}</pre>
        <pre v-if="subscriptionsStatus === 'pending'">Loading...</pre>
      </UCard>
    </div>

    <!-- subscriptions card -->
    <UCard>
      <template #title>
        <div class="flex items-center justify-between">
          Subscriptions
          <UButton
            icon="i-lucide-refresh-cw"
            variant="ghost"
            @click="() => refreshSubscriptions()"
          />
        </div>
      </template>

      <UTable
        :loading="subscriptionsStatus === 'pending'"
        :columns="columns"
        :data="subscriptions?.data ?? []"
      />
    </UCard>
  </div>
</template>
