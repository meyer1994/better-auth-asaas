'use client'

import { useQuery } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data, error } = await authClient.asaas.payments.list()
      if (error) throw error
      return data
    },
  })
}
