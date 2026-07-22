'use client'

import { useForm } from '@tanstack/react-form'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { getPaymentQuerySchema } from '@meyer1994/better-auth-asaas/zods'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type LookupAction = 'get' | 'status' | 'identificationField' | 'billingInfo' | 'viewingInfo'

type Props = {
  onLookup: (action: LookupAction, id: string) => Promise<unknown>
}

const schema = getPaymentQuerySchema.extend({ id: getPaymentQuerySchema.shape.id.min(1) })
type FormValues = z.infer<typeof schema>

export function PaymentLookupForm({ onLookup }: Props) {
  const [result, setResult] = useState<unknown>(null)
  const [loading, setLoading] = useState<LookupAction | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      id: '',
    } satisfies FormValues,
    validators: {
      onSubmit: schema,
    },
  })

  async function run(action: LookupAction) {
    const id = form.state.values.id.trim()
    if (!id) {
      setError('Payment ID is required')
      return
    }

    setLoading(action)
    setError(null)
    try {
      const data = await onLookup(action, id)
      setResult(data)
    } catch (err) {
      setError(String(err))
      setResult(null)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Payment lookup
          <Search className="size-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <form.Field name="id">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Payment ID</Label>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="pay_..."
              />
            </div>
          )}
        </form.Field>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={!!loading} onClick={() => run('get')}>
            {loading === 'get' ? '...' : 'get'}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={!!loading} onClick={() => run('status')}>
            {loading === 'status' ? '...' : 'status'}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={!!loading} onClick={() => run('identificationField')}>
            {loading === 'identificationField' ? '...' : 'identificationField'}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={!!loading} onClick={() => run('billingInfo')}>
            {loading === 'billingInfo' ? '...' : 'billingInfo'}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={!!loading} onClick={() => run('viewingInfo')}>
            {loading === 'viewingInfo' ? '...' : 'viewingInfo'}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result != null && (
          <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  )
}
