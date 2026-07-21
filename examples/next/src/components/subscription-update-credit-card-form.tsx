'use client'

import { useForm } from '@tanstack/react-form'
import { CreditCard } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Item = {
  id: string
  remoteIp: string
  creditCardToken: string
}

type Props = {
  onSubmit: (values: Item) => Promise<unknown> | unknown
}

const schema = z.object({
  id: z.string().min(1),
  remoteIp: z.string().min(1),
  creditCardToken: z.string().min(1),
}) satisfies z.ZodType<Item>

export function SubscriptionUpdateCreditCardForm({ onSubmit }: Props) {
  const form = useForm({
    defaultValues: {
      id: '',
      remoteIp: '127.0.0.1',
      creditCardToken: '',
    } as Item,

    validators: {
      onSubmit: schema,
    },

    onSubmit: async ({ value }) => {
      await onSubmit({
        id: value.id,
        remoteIp: value.remoteIp,
        creditCardToken: value.creditCardToken,
      })
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Update subscription credit card
          <Button type="submit" form="update-subscription-cc-form" variant="ghost" size="icon">
            <CreditCard className="size-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          id="update-subscription-cc-form"
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
        </form>
      </CardContent>
    </Card>
  )
}
