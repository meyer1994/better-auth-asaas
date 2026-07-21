'use client'

import { useForm } from '@tanstack/react-form'
import { Pencil } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type FormValues = {
  id: string
  description: string
  endDate: string
  nextDueDate: string
  updatePendingPayments: '' | 'true' | 'false'
}

type SubmitValues = {
  id: string
  description?: string
  endDate?: string
  nextDueDate?: string
  updatePendingPayments?: boolean
}

type Props = {
  onSubmit: (values: SubmitValues) => Promise<unknown> | unknown
}

const schema = z.object({
  id: z.string().min(1),
  description: z.string(),
  endDate: z.string(),
  nextDueDate: z.string(),
  updatePendingPayments: z.enum(['', 'true', 'false']),
}) satisfies z.ZodType<FormValues>

export function SubscriptionUpdateForm({ onSubmit }: Props) {
  const form = useForm({
    defaultValues: {
      id: '',
      description: '',
      endDate: '',
      nextDueDate: '',
      updatePendingPayments: '',
    } as FormValues,

    validators: {
      onSubmit: schema,
    },

    onSubmit: async ({ value }) => {
      await onSubmit({
        id: value.id,
        description: value.description || undefined,
        endDate: value.endDate || undefined,
        nextDueDate: value.nextDueDate || undefined,
        updatePendingPayments:
          value.updatePendingPayments === ''
            ? undefined
            : value.updatePendingPayments === 'true',
      })
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Update subscription
          <Button type="submit" form="update-subscription-form" variant="ghost" size="icon">
            <Pencil className="size-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          id="update-subscription-form"
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

          <form.Field name="endDate">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>End date</Label>
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

          <form.Field name="updatePendingPayments">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Update pending payments</Label>
                <Select
                  value={field.state.value || 'unset'}
                  onValueChange={(value: string) =>
                    field.handleChange(value === 'unset' ? '' : (value as 'true' | 'false'))
                  }
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unset">—</SelectItem>
                    <SelectItem value="true">true</SelectItem>
                    <SelectItem value="false">false</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
        </form>
      </CardContent>
    </Card>
  )
}
