'use client'

import { useForm } from '@tanstack/react-form'
import { Plus } from 'lucide-react'

import { createPaymentSchema } from '@meyer1994/better-auth-asaas/zods'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Props = {
  onSubmit: (values: Item) => Promise<unknown> | unknown
}

const schema = createPaymentSchema.extend({
  dueDate: createPaymentSchema.shape.dueDate.min(1),
  externalReference: z.string().optional(),
})
type Item = z.infer<typeof schema>

export function PaymentsForm({ onSubmit }: Props) {
  const form = useForm({
    defaultValues: {
      value: 100,
      dueDate: (() => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().slice(0, 10)
      })(),
      billingType: 'PIX',
      description: 'Test payment',
 
    } as Item,

    validators: {
      onSubmit: schema,
    },

    onSubmit: async ({ value }) => {
      await onSubmit({
        value: value.value,
        dueDate: value.dueDate,
        billingType: value.billingType,
        description: value.description || undefined,
      })
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Create payment
          <Button type="submit" form="create-payment-form" variant="ghost" size="icon">
            <Plus className="size-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          id="create-payment-form"
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

          <form.Field name="dueDate">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Due date</Label>
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

          <form.Field name="billingType">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Billing type</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value: string) => field.handleChange(value as typeof field.state.value)}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
