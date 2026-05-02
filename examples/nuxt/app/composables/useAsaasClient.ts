import type { AsaasPayment, AsaasPaymentList, AsaasPixQrCode } from 'better-auth-asaas'

type CreateChargeBody = {
  value: number
  dueDate: string
  description?: string
}

type CreateChargeResponse = AsaasPayment & {
  pixQrCode: string
  pixCopiaECola: string
}

export const useAsaasClient = () => {
  const listCharges = () =>
    $fetch<AsaasPaymentList>('/api/auth/asaas/charges')

  const getCharge = (id: string) =>
    $fetch<AsaasPayment>(`/api/auth/asaas/charge/${id}`)

  const getPixQrCode = (id: string) =>
    $fetch<AsaasPixQrCode>(`/api/auth/asaas/charge/${id}/pix`)

  const createCharge = (body: CreateChargeBody) =>
    $fetch<CreateChargeResponse>('/api/auth/asaas/charge', {
      method: 'POST',
      body
    })

  return { listCharges, getCharge, getPixQrCode, createCharge }
}
