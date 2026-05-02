<script setup lang="ts">
import type { AsaasPayment, AsaasPaymentList } from 'better-auth-asaas'
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ middleware: 'auth' })

useDashboard()

const { listCharges } = useAsaasClient()

const { data, pending, error, refresh } = await useAsyncData<AsaasPaymentList>(
  'charges',
  () => listCharges()
)

const columns: TableColumn<AsaasPayment>[] = [{
  accessorKey: 'id',
  header: 'ID'
}, {
  accessorKey: 'value',
  header: 'Valor (R$)',
  cell: ({ row }) => `R$ ${row.original.value.toFixed(2)}`
}, {
  accessorKey: 'dueDate',
  header: 'Vencimento'
}, {
  accessorKey: 'status',
  header: 'Status'
}]
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Cobranças">
        <template #right>
          <UButton icon="i-lucide-plus" to="/charges/new">Nova cobrança</UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <div class="p-4">
      <UAlert
        v-if="error"
        color="error"
        title="Erro ao carregar cobranças"
        :description="(error as any)?.message"
        class="mb-4"
      />

      <UTable
        v-if="data"
        :data="data.data"
        :columns="columns"
        :loading="pending"
        @select="(row: AsaasPayment) => navigateTo(`/charges/${row.id}`)"
        class="cursor-pointer"
      />

      <UButton
        v-if="data"
        variant="ghost"
        icon="i-lucide-refresh-cw"
        class="mt-2"
        @click="refresh"
      >
        Atualizar
      </UButton>
    </div>
  </UDashboardPanel>
</template>
