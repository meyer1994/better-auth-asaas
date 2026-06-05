'use client'

import { Button } from '@/components/ui/button'
import { useAuth, useSession } from '@/hooks/auth'
import { CreditCard, LogIn, LogOut, Repeat, UserPlus } from 'lucide-react'
import Link from 'next/link'

export function Header() {
  const auth = useAuth()
  const session = useSession()

  return (
    <header className="flex items-center justify-between border-b px-8 py-3">
      <Link href="/" className="font-semibold">better-auth-asaas</Link>

      <nav className="flex items-center gap-2">
        {!session.data?.user && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login"><LogIn className="size-4" />Login</Link>
            </Button>
        )}

        {!session.data?.user && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/register"><UserPlus className="size-4" />Register</Link>
            </Button>
        )}

        {session.data?.user && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/payments"><CreditCard className="size-4" />Payments</Link>
            </Button>
        )}
        
        {session.data?.user && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/subscriptions"><Repeat className="size-4" />Subscriptions</Link>
            </Button>
        )}

        {session.data?.user && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={async (e) => {
                e.preventDefault()
                const { error, data } = await auth.signOut()
                if (error) console.error(error)
                if (data?.success) window.location.href = '/login'
              }}
            >
              <LogOut className="size-4" /> Logout
            </Button>
        )}
      </nav>
    </header>
  )
}
