'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch('/api/admin/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong.')
    } else {
      setDone(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[#1a1a1a] px-8 py-6">
        <Logo />
      </header>
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl tracking-[3px] uppercase mb-2 text-center">
            Reset Password
          </h1>
          <p className="text-white text-xs tracking-[2px] uppercase font-ui text-center mb-10">
            Admin Account Recovery
          </p>

          {done ? (
            <>
              <p className="text-white text-sm text-center mb-8 font-body leading-relaxed">
                If that email belongs to an admin account, a reset link has been sent. Check your inbox.
              </p>
              <Link
                href="/admin/login"
                className="block text-center text-xs tracking-[2px] uppercase font-ui text-white/40 hover:text-white transition-colors"
              >
                Back to Login
              </Link>
            </>
          ) : (
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
              {error && (
                <p className="text-[#CC0000] text-sm border border-[#CC0000]/30 px-4 py-3">{error}</p>
              )}
              <Button type="submit" loading={loading} className="w-full">
                Send Reset Link
              </Button>
              <Link
                href="/admin/login"
                className="block text-center text-xs tracking-[2px] uppercase font-ui text-white/40 hover:text-white transition-colors"
              >
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
