<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

const { $auth } = useNuxtApp()
const toast = useToast()

const schema = z.object({
  id: z.string().min(1, 'Required'),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().optional(),
})

const state = reactive<{
  id: string
  month?: number
  year?: number
}>({
  id: '',
  month: undefined,
  year: undefined,
})

const pdfData = ref<string | null>(null)
const loading = ref(false)
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="flex flex-col gap-4"
    @submit.prevent="async (e: FormSubmitEvent<z.infer<typeof schema>>) => {
      loading = true
      pdfData = null
      try {
        const { data, error } = await $auth.asaas.subscriptions.paymentBook({
          query: {
            id: e.data.id,
            ...(e.data.month != null ? { month: e.data.month } : {}),
            ...(e.data.year != null ? { year: e.data.year } : {}),
          },
        })

        if (error) {
          toast.add({ title: 'Error', description: JSON.stringify(error), color: 'error' })
          return
        }

        pdfData = data?.data ?? null
        toast.add({ title: 'Payment book loaded', color: 'success' })
      }
      finally {
        loading = false
      }
    }"
  >
    <UCard>
      <template #title>
        <div class="flex items-center justify-between">
          Payment book
          <UButton
            type="submit"
            icon="i-lucide-file-text"
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
          label="Month (optional)"
          name="month"
        >
          <UInput
            v-model="state.month"
            type="number"
            min="1"
            max="12"
            step="1"
          />
        </UFormField>
        <UFormField
          label="Year (optional)"
          name="year"
        >
          <UInput
            v-model="state.year"
            type="number"
            step="1"
          />
        </UFormField>

        <a
          v-if="pdfData"
          :href="`data:application/pdf;base64,${pdfData}`"
          download="payment-book.pdf"
          class="text-primary underline"
        >
          Download payment book PDF
        </a>
      </div>
    </UCard>
  </UForm>
</template>
