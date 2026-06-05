'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/auth'
import { useForm } from '@tanstack/react-form'
import { LogIn } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

type Values = {
  email: string
  password: string
}

export default function LoginPage() {
  const auth = useAuth()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      const { email, password } = value as Values
      const { error } = await auth.signIn.email({ email, password })
      
      if (error) {
        toast.error('Sign-in failed', { description: error.message })
        return
      }

      window.location.href = '/payments'
    },
  })

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LogIn className="size-5" />Login</CardTitle>
          <CardDescription>Sign in to your account.</CardDescription>
        </CardHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
          className="space-y-4"
        >
          <CardContent className="space-y-4">
            <form.Field name="email">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Password</Label>
                  <Input
                    id={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </CardContent>

          <CardFooter className="flex flex-col items-stretch gap-3">
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary font-medium">Register</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
