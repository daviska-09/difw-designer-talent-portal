'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/layout/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/admin/login'), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="border-b border-[#1a1a1a] px-8 py-6">
        <Logo />
      </header>
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl tracking-[3px] uppercase mb-2 text-center">
            Set Password
          </h1>
          <p className="text-white text-xs tracking-[2px] uppercase font-ui text-center mb-10">
            Choose a new password
          </p>

          {done ? (
            <p className="text-emerald-400 text-sm text-center">
              Password updated. Redirecting to login...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <Input
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••••••"
              />
              <Input
                label="Confirm Password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••••••"
              />
              {error && (
                <p className="text-red-400 text-sm border border-red-900 px-4 py-3">{error}</p>
              )}
              <Button type="submit" loading={loading} className="w-full">
                Set Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
