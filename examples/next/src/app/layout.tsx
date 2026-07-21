import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'

export const metadata: Metadata = {
  title: '@meyer1994/better-auth-asaas — Next example',
  description: 'Next.js port of the Nuxt example',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <Header />
          <main className="p-8">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
