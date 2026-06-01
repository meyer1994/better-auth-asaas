import Link from 'next/link'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { LogIn, UserPlus, CreditCard } from 'lucide-react'
import { LogoutButton } from './logout-button'

export async function Header() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <header className="flex items-center justify-between border-b px-8 py-3">
      <Link href="/" className="font-semibold">better-auth-asaas</Link>

      <nav className="flex items-center gap-2">
        {!session?.user ? (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login"><LogIn className="size-4" />Login</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/register"><UserPlus className="size-4" />Register</Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/payments"><CreditCard className="size-4" />Payments</Link>
            </Button>
            <LogoutButton />
          </>
        )}
      </nav>
    </header>
  )
}
