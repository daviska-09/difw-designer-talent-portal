'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/layout/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    if (data.user?.user_metadata?.role !== 'admin') {
      await supabase.auth.signOut()
      setError('You do not have admin access.')
      setLoading(false)
      return
    }

    router.push('/admin/talent')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[#1a1a1a] px-8 py-6">
        <Logo />
      </header>
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl tracking-[3px] uppercase mb-2 text-center">
            Admin
          </h1>
          <p className="text-white text-xs tracking-[2px] uppercase font-ui text-center mb-10">
            Restricted Access
          </p>
          <form onSubmit={handleSubmit} className="space-y-8">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
            />
            {error && (
              <p className="text-red-400 text-sm border border-red-900 px-4 py-3">{error}</p>
            )}
            <Button type="submit" loading={loading} className="w-full">
              Log In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
