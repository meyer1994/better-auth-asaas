'use client'

import { useForm } from '@tanstack/react-form'
import { Plus } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Cycle = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'BIMONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'

type Item = {
  value: number
  nextDueDate: string
  cycle: Cycle
  remoteIp: string
  creditCardToken: string
  description?: string
}

type Props = {
  onSubmit: (values: Item) => Promise<unknown> | unknown
}

const schema = z.object({
  value: z.number().positive(),
  nextDueDate: z.string().min(1),
  cycle: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'YEARLY']),
  remoteIp: z.string().min(1),
  creditCardToken: z.string().min(1),
  description: z.string().optional(),
}) satisfies z.ZodType<Item>

export function SubscriptionsCreditCardForm({ onSubmit }: Props) {
  const form = useForm({
    defaultValues: {
      value: 100,
      nextDueDate: (() => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().slice(0, 10)
      })(),
      cycle: 'MONTHLY',
      remoteIp: '127.0.0.1',
      creditCardToken: '',
      description: 'Test credit card subscription',
    } as Item,

    validators: {
      onSubmit: schema,
    },

    onSubmit: async ({ value }) => {
      await onSubmit({
        value: value.value,
        nextDueDate: value.nextDueDate,
        cycle: value.cycle,
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
          Create credit card subscription
          <Button type="submit" form="create-subscription-cc-form" variant="ghost" size="icon">
            <Plus className="size-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          id="create-subscription-cc-form"
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
                  onValueChange={(value: string) => field.handleChange(value as Cycle)}
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
