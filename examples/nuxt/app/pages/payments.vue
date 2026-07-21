<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import { UseClipboard } from '@vueuse/components'
import type { Payment } from '@meyer1994/better-auth-asaas/types'
import { z } from 'zod'

const { $auth } = useNuxtApp()
const toast = useToast()

const schema = z.object({
  value: z.number().positive('Must be > 0'),
  dueDate: z.iso.date(),
  billingType: z.enum(['PIX']).default('PIX'),
  description: z.string().optional(),
})

const state = reactive<z.infer<typeof schema>>({
  value: 100,
  dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  billingType: 'PIX',
  description: 'Test payment',
})

const columns: TableColumn<Payment>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'value', header: 'Value' },
  { accessorKey: 'dueDate', header: 'Due date' },
  { accessorKey: 'billingType', header: 'Billing type' },
  { accessorKey: 'description', header: 'Description' },
  { id: 'actions', header: 'Actions' },
]

const [
  { data: session, refresh: refreshSession, status: sessionStatus },
  { data: payments, refresh: refreshPayments, status: paymentsStatus, error: paymentsError },
] = await Promise.all([
  $auth.useSession(),
  usePayments(),
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

          const { data, error } = await $auth.asaas.payments.create({
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

      <PaymentsCreateCreditCardForm @success="() => refreshPayments()" />
      <PaymentsPayWithCreditCardForm @success="() => refreshPayments()" />
      <PaymentsPayWithCardForm @success="() => refreshPayments()" />
      <PaymentsPaymentLookupForm />

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
        :columns="columns"
        :data="payments?.data ?? []"
      >
        <template #actions-cell="{ row }">
          <UModal>
            <UButton
              icon="i-lucide-qr-code"
              variant="ghost"
            />
            <template #content>
              <AsyncData
                v-slot="{ data }"
                :fetch-key="['payment', 'qr', row.original.id]"
                :handler="async () => {
                  const { data, error } = await $auth.asaas.payments.qr({ query: { id: row.original.id } })
                  if (error) throw error
                  return data
                }"
              >
                <UCard
                  title="QR"
                  :ui="{ body: 'flex flex-col items-center justify-center gap-4' }"
                >
                  <NuxtImg
                    v-if="data"
                    :src="`data:image/png;base64,${data.encodedImage}`"
                    width="256"
                    height="256"
                  />

                  <UseClipboard v-slot="{ copy }">
                    <UFieldGroup>
                      <UButton
                        label="PIX"
                        icon="i-lucide-copy"
                        class="cursor-pointer"
                        @click="() => {
                          if (!data?.payload) return
                          copy(data.payload)
                          toast.add({ title: 'Copied to clipboard', duration: 1000 })
                        }"
                      />
                      <UInput
                        type="text"
                        disabled
                        :title="data?.payload"
                        :value="data?.payload"
                      />
                    </UFieldGroup>
                  </UseClipboard>
                </UCard>
              </AsyncData>
            </template>
          </UModal>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
