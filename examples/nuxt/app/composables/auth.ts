import { asaasClient } from 'better-auth-asaas/client'
import type { Page, Payment, Subscription } from 'better-auth-asaas/types'
import { createAuthClient } from 'better-auth/vue'

export const useAuth = () => {
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
  return createAuthClient({
    baseURL: url.origin,
    fetchOptions: { headers },
    plugins: [asaasClient()],
  })
}

export const useSession = () => {
  const auth = useAuth()
  return useAsyncData(
    'session',
    async () => {
      const { data, error } = await auth.getSession()
      if (error) throw error
      return data
    },
  )
}

export const usePayments = () => {
  const auth = useAuth()
  return useAsyncData<Page<Payment>>(
    'payments',
    async () => {
      const { data, error } = await auth.asaas.payments.list()
      if (error) throw error
      return data
    },
  )
}

export const useSubscriptions = () => {
  const auth = useAuth()
  return useAsyncData<Page<Subscription>>(
    'subscriptions',
    async () => {
      const { data, error } = await auth.asaas.subscriptions.list()
      if (error) throw error
      return data
    },
  )
}
