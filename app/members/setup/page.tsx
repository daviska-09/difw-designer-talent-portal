'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/layout/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function SetupPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    // Supabase client picks up the session from the URL hash automatically
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSessionReady(true)
      } else {
        setError('This link has expired or has already been used. Please contact info@dublin-ifw.com for assistance.')
      }
    })
  }, [])

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
      router.push('/members/talent')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="border-b border-[#1a1a1a] px-8 py-6">
        <Logo />
      </header>
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <p className="text-xs tracking-[3px] uppercase font-ui font-semibold text-white mb-3 text-center">
            Member Portal
          </p>
          <h1 className="font-display text-3xl tracking-[3px] uppercase mb-4 text-center">
            Set Your Password
          </h1>
          <p className="text-[#888] text-sm text-center mb-10 font-body leading-relaxed">
            Create a password to access your DIFW member account.
          </p>

          {error && !sessionReady ? (
            <p className="text-[#CC0000] text-sm border border-[#CC0000]/30 px-4 py-3 text-center">
              {error}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
              />
              <Input
                label="Confirm Password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Repeat your password"
              />
              {error && (
                <p className="text-[#CC0000] text-sm border border-[#CC0000]/30 px-4 py-3">{error}</p>
              )}
              <Button type="submit" loading={loading} className="w-full">
                Set Password & Enter Portal
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
