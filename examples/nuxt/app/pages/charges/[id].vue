<script setup lang="ts">
import type { AsaasPayment, AsaasPixQrCode } from 'better-auth-asaas'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id = route.params.id as string
const { getCharge, getPixQrCode } = useAsaasClient()
const copied = ref(false)

const { data: charge, error: chargeError } = await useAsyncData<AsaasPayment>(
  `charge-${id}`,
  () => getCharge(id)
)

const { data: pix, error: pixError } = await useAsyncData<AsaasPixQrCode>(
  `charge-pix-${id}`,
  () => getPixQrCode(id)
)

const statusColor: Record<string, string> = {
  PENDING: 'warning',
  RECEIVED: 'success',
  CONFIRMED: 'success',
  OVERDUE: 'error',
  REFUNDED: 'neutral',
  DELETED: 'neutral'
}

async function copyPix() {
  if (!pix.value?.payload) return
  await navigator.clipboard.writeText(pix.value.payload)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="`Cobrança ${id}`">
        <template #leading>
          <UButton icon="i-lucide-arrow-left" variant="ghost" to="/" />
        </template>
      </UDashboardNavbar>
    </template>

    <div class="p-4 space-y-6 max-w-lg">
      <UAlert v-if="chargeError" color="error" title="Erro ao carregar cobrança" :description="(chargeError as any)?.message" />

      <UCard v-if="charge">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">Detalhes</span>
            <UBadge :color="statusColor[charge.status] ?? 'neutral'" :label="charge.status" />
          </div>
        </template>

        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-muted">Valor</dt>
            <dd class="font-medium">R$ {{ charge.value.toFixed(2) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted">Vencimento</dt>
            <dd>{{ charge.dueDate }}</dd>
          </div>
          <div v-if="charge.description" class="flex justify-between">
            <dt class="text-muted">Descrição</dt>
            <dd>{{ charge.description }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted">Criado em</dt>
            <dd>{{ charge.dateCreated }}</dd>
          </div>
        </dl>
      </UCard>

      <UCard v-if="pix && !pixError">
        <template #header>
          <span class="font-medium">PIX</span>
        </template>

        <div class="flex flex-col items-center gap-4">
          <img
            :src="`data:image/png;base64,${pix.encodedImage}`"
            alt="QR Code PIX"
            class="w-48 h-48 rounded"
          />

          <div class="w-full space-y-2">
            <p class="text-sm text-muted">Copia e cola</p>
            <div class="flex gap-2">
              <UInput :model-value="pix.payload" readonly class="flex-1 font-mono text-xs" />
              <UButton
                :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
                :color="copied ? 'success' : 'neutral'"
                variant="outline"
                @click="copyPix"
              />
            </div>
            <p class="text-xs text-muted">Expira em: {{ pix.expirationDate }}</p>
          </div>
        </div>
      </UCard>

      <UAlert
        v-if="pixError"
        color="warning"
        title="QR Code não disponível"
        description="O QR Code PIX pode não estar disponível para cobranças já pagas ou expiradas."
      />
    </div>
  </UDashboardPanel>
</template>
