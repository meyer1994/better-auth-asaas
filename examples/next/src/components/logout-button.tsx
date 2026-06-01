'use client'

import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  async function onClick() {
    const { error } = await authClient.signOut()
    if (error) {
      console.error(error)
      return
    }
    router.replace('/login')
    router.refresh()
  }

  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <LogOut className="size-4" />
      Logout
    </Button>
  )
}
