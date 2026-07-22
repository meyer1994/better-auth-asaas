'use client'

import { useForm } from '@tanstack/react-form'
import { Plus } from 'lucide-react'
import { createPaymentWithCreditCardSchema } from '@meyer1994/better-auth-asaas/zods'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = createPaymentWithCreditCardSchema.safeExtend({
  dueDate: createPaymentWithCreditCardSchema.shape.dueDate.min(1),
  remoteIp: createPaymentWithCreditCardSchema.shape.remoteIp.min(1),
  creditCardToken: createPaymentWithCreditCardSchema.shape.creditCardToken.unwrap().min(1),
})
type Item = z.infer<typeof schema>

type Props = {
  onSubmit: (values: Item) => Promise<unknown> | unknown
}

export function PaymentsCreditCardForm({ onSubmit }: Props) {
  const form = useForm({
    defaultValues: {
      value: 100,
      dueDate: (() => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().slice(0, 10)
      })(),
      remoteIp: '127.0.0.1',
      creditCardToken: '',
      description: 'Test credit card payment',
    } as Item,

    validators: {
      onSubmit: schema,
    },

    onSubmit: async ({ value }) => {
      await onSubmit({
        value: value.value,
        dueDate: value.dueDate,
        remoteIp: value.remoteIp,
        creditCardToken: value.creditCardToken,
        description: value.description || undefined,
      })
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Create credit card payment
          <Button type="submit" form="create-payment-cc-form" variant="ghost" size="icon">
            <Plus className="size-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          id="create-payment-cc-form"
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

          <form.Field name="creditCardToken">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Credit card token</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="tok_..."
                />
              </div>
            )}
          </form.Field>

          <form.Field name="remoteIp">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Remote IP</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
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
