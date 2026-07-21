'use client'

import { useForm } from '@tanstack/react-form'
import { List } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'

import type { Page, Payment } from '@meyer1994/better-auth-asaas/types'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const STATUS_OPTIONS = [
  'PENDING',
  'RECEIVED',
  'CONFIRMED',
  'OVERDUE',
  'REFUNDED',
  'RECEIVED_IN_CASH',
  'REFUND_REQUESTED',
  'REFUND_IN_PROGRESS',
  'CHARGEBACK_REQUESTED',
  'CHARGEBACK_DISPUTE',
  'AWAITING_CHARGEBACK_REVERSAL',
  'DUNNING_REQUESTED',
  'DUNNING_RECEIVED',
  'AWAITING_RISK_ANALYSIS',
] as const

type SubscriptionPaymentStatus = (typeof STATUS_OPTIONS)[number]

type Item = {
  id: string
  status: SubscriptionPaymentStatus | ''
}

type Props = {
  onSubmit: (values: {
    id: string
    status?: SubscriptionPaymentStatus
  }) => Promise<Page<Payment> | unknown>
}

const schema = z.object({
  id: z.string().min(1),
  status: z.union([z.enum(STATUS_OPTIONS), z.literal('')]),
}) satisfies z.ZodType<Item>

export function SubscriptionPaymentsForm({ onSubmit }: Props) {
  const [result, setResult] = useState<Page<Payment> | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      id: '',
      status: '',
    } as Item,

    validators: {
      onSubmit: schema,
    },

    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const data = await onSubmit({
          id: value.id,
          status: value.status || undefined,
        })
        setResult(data as Page<Payment>)
      } catch (err) {
        setError(String(err))
        setResult(null)
      }
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Subscription payments
          <Button type="submit" form="subscription-payments-form" variant="ghost" size="icon">
            <List className="size-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <form
          id="subscription-payments-form"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field name="id">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Subscription ID</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="sub_..."
                />
              </div>
            )}
          </form.Field>

          <form.Field name="status">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Status (optional)</Label>
                <Select
                  value={field.state.value || 'all'}
                  onValueChange={(value: string) =>
                    field.handleChange(value === 'all' ? '' : (value as SubscriptionPaymentStatus))
                  }
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Billing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(result.data ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>No payments</TableCell>
                  </TableRow>
                )}
                {(result.data ?? []).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                    <TableCell>{payment.value}</TableCell>
                    <TableCell>{payment.dueDate}</TableCell>
                    <TableCell>{payment.status}</TableCell>
                    <TableCell>{payment.billingType}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
