'use client'

import { useForm } from '@tanstack/react-form'
import { Trash2 } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Item = {
  id: string
}

type Props = {
  onSubmit: (values: Item) => Promise<unknown> | unknown
}

const schema = z.object({
  id: z.string().min(1),
}) satisfies z.ZodType<Item>

export function SubscriptionDeleteForm({ onSubmit }: Props) {
  const form = useForm({
    defaultValues: {
      id: '',
    } as Item,

    validators: {
      onSubmit: schema,
    },

    onSubmit: async ({ value }) => {
      await onSubmit({ id: value.id })
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Delete subscription
          <Button type="submit" form="delete-subscription-form" variant="ghost" size="icon">
            <Trash2 className="size-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          id="delete-subscription-form"
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
        </form>
      </CardContent>
    </Card>
  )
}
