<script setup lang="ts">
import { z } from 'zod'

const { $auth } = useNuxtApp()
const toast = useToast()

const schema = z.object({
  id: z.string().min(1, 'Required'),
})

const state = reactive<z.infer<typeof schema>>({
  id: '',
})

const result = ref<unknown>(null)
const loading = ref(false)

type LookupAction = 'get' | 'status' | 'identificationField' | 'billingInfo' | 'viewingInfo'

async function run(action: LookupAction) {
  const parsed = schema.safeParse(state)
  if (!parsed.success) {
    toast.add({ title: 'Error', description: 'Payment ID is required', color: 'error' })
    return
  }

  loading.value = true
  result.value = null

  try {
    const query = { id: parsed.data.id }
    const response = await ({
      get: () => $auth.asaas.payments.get({ query }),
      status: () => $auth.asaas.payments.status({ query }),
      identificationField: () => $auth.asaas.payments.identificationField({ query }),
      billingInfo: () => $auth.asaas.payments.billingInfo({ query }),
      viewingInfo: () => $auth.asaas.payments.viewingInfo({ query }),
    })[action]()

    if (response.error) {
      toast.add({ title: 'Error', description: JSON.stringify(response.error), color: 'error' })
      return
    }

    result.value = response.data
    toast.add({ title: `Payment ${action}`, description: 'Loaded', color: 'success' })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UCard>
    <template #title>
      Payment lookup
    </template>

    <div class="flex flex-col gap-3">
      <UFormField
        label="Payment ID"
        name="id"
      >
        <UInput v-model="state.id" />
      </UFormField>

      <div class="flex flex-wrap gap-2">
        <UButton
          label="Get"
          :loading="loading"
          variant="soft"
          @click="() => run('get')"
        />
        <UButton
          label="Status"
          :loading="loading"
          variant="soft"
          @click="() => run('status')"
        />
        <UButton
          label="Identification field"
          :loading="loading"
          variant="soft"
          @click="() => run('identificationField')"
        />
        <UButton
          label="Billing info"
          :loading="loading"
          variant="soft"
          @click="() => run('billingInfo')"
        />
        <UButton
          label="Viewing info"
          :loading="loading"
          variant="soft"
          @click="() => run('viewingInfo')"
        />
      </div>

      <pre
        v-if="result"
        class="overflow-x-auto text-xs"
      >{{ result }}</pre>
    </div>
  </UCard>
</template>
