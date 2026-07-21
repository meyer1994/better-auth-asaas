'use client'

import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { SubscriptionDeleteForm } from '@/components/subscription-delete-form'
import { SubscriptionPaymentBookForm } from '@/components/subscription-payment-book-form'
import { SubscriptionPaymentsForm } from '@/components/subscription-payments-form'
import { SubscriptionUpdateCreditCardForm } from '@/components/subscription-update-credit-card-form'
import { SubscriptionUpdateForm } from '@/components/subscription-update-form'
import { SubscriptionsCreditCardForm } from '@/components/subscriptions-credit-card-form'
import { SubscriptionsForm } from '@/components/subscriptions-form'
import { SubscriptionsTable } from '@/components/subscriptions-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth, useSession, useSubscriptions } from '@/hooks/auth'

export default function SubscriptionsPage() {
  const auth = useAuth()
  const session = useSession()
  const subscriptions = useSubscriptions()

  return (
    <div className="grid w-full gap-4 lg:grid-cols-3">
      <div className="flex flex-col gap-4">
        <SubscriptionsForm onSubmit={async (e) => {
          const { error, data } = await auth.asaas.subscriptions.create(e)
          if (error) {
            console.error(error)
            toast.error(error.message ?? 'Failed to create subscription')
          }
          if (data) {
            toast.success('Subscription created')
            await subscriptions.refetch()
          }
        }} />

        <SubscriptionsCreditCardForm onSubmit={async (e) => {
          const { error, data } = await auth.asaas.subscriptions.createCreditCard(e)
          if (error) {
            console.error(error)
            toast.error(error.message ?? 'Failed to create credit card subscription')
          }
          if (data) {
            console.log(data)
            toast.success('Credit card subscription created')
            await subscriptions.refetch()
          }
        }} />

        <SubscriptionUpdateForm onSubmit={async (e) => {
          const { error, data } = await auth.asaas.subscriptions.update(e)
          if (error) {
            console.error(error)
            toast.error(error.message ?? 'Failed to update subscription')
          }
          if (data) {
            console.log(data)
            toast.success('Subscription updated')
            await subscriptions.refetch()
          }
        }} />

        <SubscriptionUpdateCreditCardForm onSubmit={async (e) => {
          const { error, data } = await auth.asaas.subscriptions.updateCreditCard(e)
          if (error) {
            console.error(error)
            toast.error(error.message ?? 'Failed to update credit card')
          }
          if (data) {
            console.log(data)
            toast.success('Subscription credit card updated')
            await subscriptions.refetch()
          }
        }} />
      </div>

      <div className="flex flex-col gap-4">
        <SubscriptionDeleteForm onSubmit={async (e) => {
          const { error, data } = await auth.asaas.subscriptions.delete(e)
          if (error) {
            console.error(error)
            toast.error(error.message ?? 'Failed to delete subscription')
          }
          if (data) {
            console.log(data)
            toast.success('Subscription deleted')
            await subscriptions.refetch()
          }
        }} />

        <SubscriptionPaymentsForm onSubmit={async (e) => {
          const { error, data } = await auth.asaas.subscriptions.payments({
            query: {
              id: e.id,
              ...(e.status ? { status: e.status } : {}),
            },
          })
          if (error) {
            console.error(error)
            toast.error(error.message ?? 'Failed to list subscription payments')
            throw error
          }
          console.log(data)
          toast.success('Subscription payments loaded')
          return data
        }} />

        <SubscriptionPaymentBookForm onSubmit={async (e) => {
          const { error, data } = await auth.asaas.subscriptions.paymentBook({
            query: {
              id: e.id,
              ...(e.month != null ? { month: e.month } : {}),
              ...(e.year != null ? { year: e.year } : {}),
            },
          })
          if (error) {
            console.error(error)
            toast.error(error.message ?? 'Failed to fetch payment book')
            throw error
          }
          console.log(data)
          toast.success('Payment book ready')
          return data
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
            Subscriptions
            <Button variant="ghost" size="icon" onClick={() => subscriptions.refetch()}>
              <RefreshCw className="size-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionsTable subscriptions={subscriptions} />
        </CardContent>
      </Card>
    </div>
  )
}
