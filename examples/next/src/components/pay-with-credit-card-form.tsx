'use client'

import { useForm } from '@tanstack/react-form'
import { CreditCard } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Mode = 'payWithCreditCard' | 'payWithCard'

type Item = {
  mode: Mode
  id: string
  token: string
}

type PayWithCreditCardValues = {
  mode: 'payWithCreditCard'
  id: string
  creditCardToken: string
}

type PayWithCardValues = {
  mode: 'payWithCard'
  id: string
  cardType: 'CREDIT'
  cardToken: string
}

export type PayWithCardFormValues = PayWithCreditCardValues | PayWithCardValues

type Props = {
  onSubmit: (values: PayWithCardFormValues) => Promise<unknown> | unknown
}

const schema = z.object({
  mode: z.enum(['payWithCreditCard', 'payWithCard']),
  id: z.string().min(1),
  token: z.string().min(1),
}) satisfies z.ZodType<Item>

export function PayWithCreditCardForm({ onSubmit }: Props) {
  const form = useForm({
    defaultValues: {
      mode: 'payWithCreditCard',
      id: '',
      token: '',
    } as Item,

    validators: {
      onSubmit: schema,
    },

    onSubmit: async ({ value }) => {
      if (value.mode === 'payWithCard') {
        await onSubmit({
          mode: 'payWithCard',
          id: value.id,
          cardType: 'CREDIT',
          cardToken: value.token,
        })
        return
      }

      await onSubmit({
        mode: 'payWithCreditCard',
        id: value.id,
        creditCardToken: value.token,
      })
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Pay with credit card
          <Button type="submit" form="pay-with-cc-form" variant="ghost" size="icon">
            <CreditCard className="size-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          id="pay-with-cc-form"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field name="mode">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Mode</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value: string) => field.handleChange(value as Mode)}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payWithCreditCard">payWithCreditCard</SelectItem>
                    <SelectItem value="payWithCard">payWithCard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

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

          <form.Field name="token">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Card token</Label>
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
        </form>
      </CardContent>
    </Card>
  )
}
