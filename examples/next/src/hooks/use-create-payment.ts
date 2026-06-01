'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'

export type CreatePaymentInput = {
  value: number
  dueDate: string
  billingType: 'PIX'
  description?: string
}

export function useCreatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreatePaymentInput) => {
      // `customer` is required by the plugin body schema but is overwritten
      // server-side with the session's asaasCustomerId. Pass empty placeholder.
      const { data, error } = await authClient.asaas.payments.create({
        ...input,
      })
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      toast.success('Payment created', { description: data?.id })
      qc.invalidateQueries({ queryKey: ['payments'] })
    },
    onError: (err) => {
      toast.error('Error', { description: String(err) })
    },
  })
}
