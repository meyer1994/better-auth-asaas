'use client'

import { useQuery } from '@tanstack/react-query'
import { asaasClient } from '@meyer1994/better-auth-asaas/client'
import type {
  CreatePayment,
  Page,
  Payment,
  Subscription
} from '@meyer1994/better-auth-asaas/types'
import { createAuthClient } from 'better-auth/react'
import type { Session, User } from 'better-auth/types'

export type CreatePaymentInput = Omit<CreatePayment, 'customer'>

const auth = createAuthClient({
  plugins: [asaasClient()],
})

export const useAuth = () => auth

export function useSession() {
  const auth = useAuth()

  return useQuery<{ user: User; session: Session }>({
    queryKey: ['session'],
    queryFn: async () => {
      const { data, error } = await auth.getSession()
      if (error) throw error
      if (!data) throw new Error('Session not found')
      return data
    },
  })
}

export function usePayments() {
  const auth = useAuth()

  return useQuery<Page<Payment>>({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data, error } = await auth.asaas.payments.list()
      if (error) throw error
      return data
    },
  })
}

export function useSubscriptions() {
  const auth = useAuth()

  return useQuery<Page<Subscription>>({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const { data, error } = await auth.asaas.subscriptions.list()
      if (error) throw error
      return data
    },
  })
}

