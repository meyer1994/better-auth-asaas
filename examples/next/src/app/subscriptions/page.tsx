'use client'

import { RefreshCw } from 'lucide-react'

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
    <div className="grid w-full gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <SubscriptionsForm onSubmit={async (e) => {
          const { error, data } = await auth.asaas.subscriptions.create(e)
          if (error) console.error(error)
          if (data) await subscriptions.refetch()
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
