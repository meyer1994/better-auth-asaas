'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, RefreshCw, QrCode, Copy } from 'lucide-react'
import Image from 'next/image'

import { authClient, useSession } from '@/lib/auth-client'
import { usePayments } from '@/hooks/use-payments'
import { useCreatePayment } from '@/hooks/use-create-payment'
import { AsyncData } from '@/components/async-data'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const schema = z.object({
  value: z.coerce.number().positive('Must be > 0'),
  dueDate: z.string().min(1),
  billingType: z.literal('PIX').default('PIX'),
  description: z.string().optional(),
})

type Values = z.infer<typeof schema>

export default function PaymentsPage() {
  const router = useRouter()
  const session = useSession()
  const payments = usePayments()
  const createPayment = useCreatePayment()

  // Lightweight client-side guard, matching the Nuxt example's posture.
  useEffect(() => {
    if (!session.isPending && !session.data?.user) router.replace('/login')
  }, [session.isPending, session.data, router])

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      value: 100,
      dueDate: '2026-06-20',
      billingType: 'PIX',
      description: 'Test payment',
    },
  })

  async function onSubmit(values: Values) {
    await createPayment.mutateAsync(values)
  }

  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      {/* Left column: form + session */}
      <div className="flex flex-col gap-4">
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
            <Form {...form}>
              <form id="create-payment-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="value" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl><Input type="number" step="1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dueDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="billingType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Session
              <Button variant="ghost" size="icon" onClick={() => session.refetch()}>
                <RefreshCw className="size-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs">{JSON.stringify(session.data, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>

      {/* Right column: payments table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Payments
            <Button variant="ghost" size="icon" onClick={() => payments.refetch()}>
              <RefreshCw className="size-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead>Billing type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.isPending && (
                <TableRow><TableCell colSpan={6}>Loading…</TableCell></TableRow>
              )}
              {payments.isError && (
                <TableRow><TableCell colSpan={6} className="text-destructive">{String(payments.error)}</TableCell></TableRow>
              )}
              {payments.data?.data?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.value}</TableCell>
                  <TableCell>{p.dueDate}</TableCell>
                  <TableCell>{p.billingType}</TableCell>
                  <TableCell>{p.description}</TableCell>
                  <TableCell><QrButton id={p.id} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function QrButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const qr = useQuery({
    queryKey: ['payment-qr', id],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await authClient.asaas.payments.qr({ query: { id } })
      if (error) throw error
      return data
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon"><QrCode className="size-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>QR</DialogTitle></DialogHeader>
        <AsyncData query={qr}>
          {(data) => (
            <div className="flex flex-col items-center gap-4">
              {data?.encodedImage && (
                <Image
                  src={`data:image/png;base64,${data.encodedImage}`}
                  width={256}
                  height={256}
                  alt="PIX QR code"
                  unoptimized
                />
              )}
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!data?.payload) return
                    navigator.clipboard.writeText(data.payload)
                    toast.success('Copied to clipboard', { duration: 1000 })
                  }}
                >
                  <Copy className="size-4" />PIX
                </Button>
                <Input readOnly value={data?.payload ?? ''} title={data?.payload ?? ''} />
              </div>
            </div>
          )}
        </AsyncData>
      </DialogContent>
    </Dialog>
  )
}
