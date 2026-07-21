'use client'

import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { PayWithCreditCardForm } from '@/components/pay-with-credit-card-form'
import { PaymentLookupForm } from '@/components/payment-lookup-form'
import { PaymentsCreditCardForm } from '@/components/payments-credit-card-form'
import { PaymentsForm } from '@/components/payments-form'
import { PaymentsTable } from '@/components/payments-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth, usePayments, useSession } from '@/hooks/auth'

export default function PaymentsPage() {
  const auth = useAuth()
  const session = useSession()
  const payments = usePayments()

  return (
    <div className="grid w-full gap-4 lg:grid-cols-3">
      <div className="flex flex-col gap-4">
        <PaymentsForm onSubmit={async (e) => {
          const { error, data } = await auth.asaas.payments.create(e)
          if (error) {
            console.error(error)
            toast.error(error.message ?? 'Failed to create payment')
          }
          if (data) {
            toast.success('Payment created')
            await payments.refetch()
          }
        }} />

        <PaymentsCreditCardForm onSubmit={async (e) => {
          const { error, data } = await auth.asaas.payments.createCreditCard(e)
          if (error) {
            console.error(error)
            toast.error(error.message ?? 'Failed to create credit card payment')
          }
          if (data) {
            console.log(data)
            toast.success('Credit card payment created')
            await payments.refetch()
          }
        }} />

        <PayWithCreditCardForm onSubmit={async (e) => {
          if (e.mode === 'payWithCard') {
            const { error, data } = await auth.asaas.payments.payWithCard({
              id: e.id,
              cardType: e.cardType,
              cardToken: e.cardToken,
            })
            if (error) {
              console.error(error)
              toast.error(error.message ?? 'payWithCard failed')
            }
            if (data) {
              console.log(data)
              toast.success('Paid with card')
              await payments.refetch()
            }
            return
          }

          const { error, data } = await auth.asaas.payments.payWithCreditCard({
            id: e.id,
            creditCardToken: e.creditCardToken,
          })
          if (error) {
            console.error(error)
            toast.error(error.message ?? 'payWithCreditCard failed')
          }
          if (data) {
            console.log(data)
            toast.success('Paid with credit card')
            await payments.refetch()
          }
        }} />
      </div>

      <div className="flex flex-col gap-4">
        <PaymentLookupForm onLookup={async (action, id) => {
          const query = { query: { id } } as const
          const result =
            action === 'get' ? await auth.asaas.payments.get(query)
            : action === 'status' ? await auth.asaas.payments.status(query)
            : action === 'identificationField' ? await auth.asaas.payments.identificationField(query)
            : action === 'billingInfo' ? await auth.asaas.payments.billingInfo(query)
            : await auth.asaas.payments.viewingInfo(query)

          if (result.error) {
            console.error(result.error)
            toast.error(result.error.message ?? `${action} failed`)
            throw result.error
          }

          console.log(action, result.data)
          toast.success(`${action} ok`)
          return result.data
        }} />

        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Session
              <Button variant="ghost" size="icon" onClick={() => session.refetch()}>
                <RefreshCw className="size-4" />
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <pre className="text-xs">{JSON.stringify(session.data, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Payments
            <Button variant="ghost" size="icon" onClick={() => payments.refetch()}>
              <RefreshCw className="size-4" />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <PaymentsTable payments={payments} />
        </CardContent>
      </Card>
    </div>
  )
}
