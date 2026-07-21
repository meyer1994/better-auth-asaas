import type { Page, Payment, Subscription } from 'better-auth-asaas/types'

export const usePayments = () => {
  const { $auth } = useNuxtApp()
  return useAsyncData<Page<Payment>>(
    'payments',
    async () => {
      const { data, error } = await $auth.asaas.payments.list()
      if (error) throw error
      return data
    },
  )
}

export const useSubscriptions = () => {
  const { $auth } = useNuxtApp()
  return useAsyncData<Page<Subscription>>(
    'subscriptions',
    async () => {
      const { data, error } = await $auth.asaas.subscriptions.list()
      if (error) throw error
      return data
    },
  )
}
