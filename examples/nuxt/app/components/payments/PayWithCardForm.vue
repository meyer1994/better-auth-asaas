<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { payWithCardSchema } from '@meyer1994/better-auth-asaas/zods'
import { z } from 'zod'

const emit = defineEmits<{ success: [] }>()

const { $auth } = useNuxtApp()
const toast = useToast()

const schema = payWithCardSchema.safeExtend({
  id: z.string().min(1, 'Required'),
  cardToken: z.string().min(1, 'Required'),
})

const state = reactive<z.infer<typeof schema>>({
  id: '',
  cardType: 'CREDIT',
  cardToken: '',
})
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="flex flex-col gap-4"
    @submit.prevent="async (e: FormSubmitEvent<z.infer<typeof schema>>) => {
      const { data, error } = await $auth.asaas.payments.payWithCard({
        id: e.data.id,
        cardType: e.data.cardType,
        cardToken: e.data.cardToken,
      })

      if (error) toast.add({ title: 'Error', description: JSON.stringify(error), color: 'error' })
      if (data) {
        toast.add({ title: 'Paid with card', description: JSON.stringify(data), color: 'success' })
        emit('success')
      }
    }"
  >
    <UCard>
      <template #title>
        <div class="flex items-center justify-between">
          Pay with card
          <UButton
            type="submit"
            icon="i-lucide-wallet-cards"
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
          label="Card type"
          name="cardType"
        >
          <USelect
            v-model="state.cardType"
            :items="['CREDIT', 'VOUCHER']"
          />
        </UFormField>
        <UFormField
          label="Card token"
          name="cardToken"
        >
          <UInput v-model="state.cardToken" />
        </UFormField>
      </div>
    </UCard>
  </UForm>
</template>
