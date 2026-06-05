'use client'

import type { PixQrCode } from 'better-auth-asaas/types'
import { Copy, QrCode } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCopyToClipboard } from 'usehooks-ts'

import { AsyncData } from '@/components/async-data'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/auth'


export function PaymentQrButton({ id }: { id: string }) {
  const auth = useAuth()

  const [open, setOpen] = useState(false)
  const [, copy] = useCopyToClipboard()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon"><QrCode className="size-4" /></Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR</DialogTitle>
        </DialogHeader>

        <AsyncData<PixQrCode | null>
          queryKey={['payment', 'qr', id]}
          enabled={open}
          queryFn={async () => {
            const { data, error } = await auth.asaas.payments.qr({ query: { id } })
            if (error) throw error
            return data
          }}
        >
          {({ data }) => (
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
                  onClick={async () => {
                    if (!data?.payload) return
                    await copy(data.payload)
                    toast.success('Copied to clipboard', { duration: 1000 })
                  }}
                >
                  <Copy className="size-4" />PIX
                </Button>
                <Input readOnly value={data?.payload ?? ''} title={data?.payload ?? ''} />
              </div>

              {!data && <p className="text-sm text-muted-foreground">No QR code data.</p>}
            </div>
          )}
        </AsyncData>
      </DialogContent>
    </Dialog>
  )
}
