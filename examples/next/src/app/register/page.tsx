'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/auth'
import { useForm } from '@tanstack/react-form'
import { UserPlus } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

type Values = {
  name: string
  cpfCnpj: string
  email: string
  password: string
}

export default function RegisterPage() {
  const auth = useAuth()

  const form = useForm({
    defaultValues: {
      name: '',
      cpfCnpj: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      const { name, email, password, cpfCnpj } = value as Values
      const { error } = await auth.signUp.email({
        name,
        email,
        password,
        cpfCnpj,
      })

      if (error) {
        toast.error('Sign-up failed', { description: error.message })
        return
      }

      window.location.href = '/payments'
    },
  })

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus className="size-5" />Create an account</CardTitle>
          <CardDescription>Sign up to get started.</CardDescription>
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
            <form.Field name="name">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Name</Label>
                  <Input
                    id={field.name}
                    placeholder="Jane Doe"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="cpfCnpj">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>CPF/CNPJ</Label>
                  <Input
                    id={field.name}
                    placeholder="12345678901"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="email">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    type="email"
                    placeholder="you@example.com"
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
                    placeholder="••••••••"
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
              {form.state.isSubmitting ? 'Creating…' : 'Sign up'}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-medium">Login</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
