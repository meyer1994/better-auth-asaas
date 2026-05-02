<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ middleware: 'auth' })

const { createCharge } = useAsaasClient()
const error = ref<string | null>(null)
const submitting = ref(false)

const today = new Date().toISOString().slice(0, 10)

const schema = z.object({
  value: z.coerce.number().positive('Valor deve ser positivo'),
  dueDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato AAAA-MM-DD')
    .refine(d => d >= today, 'Data deve ser hoje ou futura'),
  description: z.string().max(500).optional()
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  value: undefined,
  dueDate: today,
  description: ''
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  error.value = null
  submitting.value = true
  try {
    const result = await createCharge({
      value: event.data.value,
      dueDate: event.data.dueDate,
      description: event.data.description || undefined
    })
    await navigateTo(`/charges/${result.id}`)
  } catch (err: any) {
    error.value = err?.data?.message ?? err?.message ?? 'Erro ao criar cobrança.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Nova cobrança">
        <template #leading>
          <UButton icon="i-lucide-arrow-left" variant="ghost" to="/" />
        </template>
      </UDashboardNavbar>
    </template>

    <div class="p-4 max-w-md">
      <UAlert v-if="error" color="error" :description="error" class="mb-4" />

      <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-4">
        <UFormField label="Valor (R$)" name="value">
          <UInput v-model="state.value" type="number" step="0.01" min="0.01" placeholder="10.00" class="w-full" />
        </UFormField>
        <UFormField label="Vencimento" name="dueDate">
          <UInput v-model="state.dueDate" type="date" :min="today" class="w-full" />
        </UFormField>
        <UFormField label="Descrição (opcional)" name="description">
          <UTextarea v-model="state.description" placeholder="Descrição da cobrança" :rows="3" class="w-full" />
        </UFormField>
        <UButton type="submit" :loading="submitting" block>Criar cobrança PIX</UButton>
      </UForm>
    </div>
  </UDashboardPanel>
</template>
