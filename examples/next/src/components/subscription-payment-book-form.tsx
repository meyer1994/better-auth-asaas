'use client'

import { useForm } from '@tanstack/react-form'
import { FileDown } from 'lucide-react'
import { useState } from 'react'
import { paymentBookQuerySchema } from '@meyer1994/better-auth-asaas/zods'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type PaymentBook = {
  contentType: string
  data: string
}

const schema = paymentBookQuerySchema.extend({
  id: paymentBookQuerySchema.shape.id.min(1),
  month: z.string().optional(),
  year: z.string().optional(),
})
type Item = z.infer<typeof schema>
type SubmitValues = z.infer<typeof paymentBookQuerySchema>

type Props = {
  onSubmit: (values: SubmitValues) => Promise<PaymentBook | unknown>
}

export function SubscriptionPaymentBookForm({ onSubmit }: Props) {
  const [pdfHref, setPdfHref] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      id: '',
      month: '',
      year: '',
    } as Item,

    validators: {
      onSubmit: schema,
    },

    onSubmit: async ({ value }) => {
      setError(null)
      setPdfHref(null)
      try {
        const month = value.month ? Number(value.month) : undefined
        const year = value.year ? Number(value.year) : undefined
        const data = (await onSubmit({
          id: value.id,
          month: Number.isFinite(month) ? month : undefined,
          year: Number.isFinite(year) ? year : undefined,
        })) as PaymentBook

        if (!data?.data) {
          setError('No PDF data returned')
          return
        }

        const contentType = data.contentType || 'application/pdf'
        setPdfHref(`data:${contentType};base64,${data.data}`)
      } catch (err) {
        setError(String(err))
      }
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Subscription payment book
          <Button type="submit" form="subscription-payment-book-form" variant="ghost" size="icon">
            <FileDown className="size-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <form
          id="subscription-payment-book-form"
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
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="sub_..."
                />
              </div>
            )}
          </form.Field>

          <form.Field name="month">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Month (optional)</Label>
                <Input
                  id={field.name}
                  type="number"
                  min={1}
                  max={12}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="1–12"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="year">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Year (optional)</Label>
                <Input
                  id={field.name}
                  type="number"
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="2026"
                />
              </div>
            )}
          </form.Field>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {pdfHref && (
          <a
            href={pdfHref}
            download="payment-book.pdf"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            Download payment book PDF
          </a>
        )}
      </CardContent>
    </Card>
  )
}
