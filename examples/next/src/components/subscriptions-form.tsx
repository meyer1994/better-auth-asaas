'use client'

import { useForm } from '@tanstack/react-form'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { z } from 'zod'

import type { CreateSubscription } from 'better-auth-asaas/types'


type Item = Omit<CreateSubscription, 'customer'>

type Props = {
  onSubmit: (val: Item) => Promise<unknown> | unknown
}

const schema = z.object({
  value: z.number().positive(),
  nextDueDate: z.string(),
  cycle: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'YEARLY']),
  billingType: z.enum(['UNDEFINED', 'BOLETO', 'CREDIT_CARD', 'PIX']),
  description: z.string().optional(),
}) satisfies z.ZodType<Item>

export function SubscriptionsForm({ onSubmit }: Props) {
  const form = useForm({
    defaultValues: {
      value: 100,
      nextDueDate: '2026-06-20',
      cycle: 'MONTHLY',
      billingType: 'PIX',
      description: 'Test subscription',
    } as Item,

    validators: {
      onSubmit: schema,
    },

    onSubmit: async ({ value }) => {
      await onSubmit({
        value: value.value,
        nextDueDate: value.nextDueDate,
        cycle: value.cycle,
        billingType: value.billingType,
        description: value.description || undefined,
      })
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Create subscription
          <Button type="submit" form="create-subscription-form" variant="ghost" size="icon">
            <Plus className="size-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          id="create-subscription-form"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field name="value">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Value</Label>
                <Input
                  id={field.name}
                  type="number"
                  step="1"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(Number(event.target.value))}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="nextDueDate">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Next due date</Label>
                <Input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="cycle">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Cycle</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as typeof field.state.value)}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">WEEKLY</SelectItem>
                    <SelectItem value="BIWEEKLY">BIWEEKLY</SelectItem>
                    <SelectItem value="MONTHLY">MONTHLY</SelectItem>
                    <SelectItem value="BIMONTHLY">BIMONTHLY</SelectItem>
                    <SelectItem value="QUARTERLY">QUARTERLY</SelectItem>
                    <SelectItem value="SEMIANNUALLY">SEMIANNUALLY</SelectItem>
                    <SelectItem value="YEARLY">YEARLY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Field name="billingType">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Billing type</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as typeof field.state.value)}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNDEFINED">UNDEFINED</SelectItem>
                    <SelectItem value="BOLETO">BOLETO</SelectItem>
                    <SelectItem value="CREDIT_CARD">CREDIT_CARD</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Description</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </div>
            )}
          </form.Field>
        </form>
      </CardContent>
    </Card>
  )
}
