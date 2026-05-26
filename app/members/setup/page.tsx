'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type Step = 'loading' | 'request-link' | 'check-email' | 'set-password'

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('loading')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setStep(data.session ? 'set-password' : 'request-link')
    })
  }, [])

  async function handleRequestLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch('/api/members/send-access-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.')
    } else {
      setStep('check-email')
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
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
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <p className="text-xs tracking-[3px] uppercase font-ui font-semibold text-white mb-3 text-center">
            DIFW Portal
          </p>

          {step === 'loading' && null}

          {step === 'request-link' && (
            <>
              <h1 className="font-display text-3xl tracking-[3px] uppercase mb-4 text-center">
                Access Your Account
              </h1>
              <p className="text-white text-sm text-center mb-10 font-body leading-relaxed">
                Enter your email address and we&apos;ll send you a sign-in link.
              </p>
              <form onSubmit={handleRequestLink} className="space-y-8">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                />
                {error && (
                  <p className="text-[#CC0000] text-sm border border-[#CC0000]/30 px-4 py-3">{error}</p>
                )}
                <Button type="submit" loading={loading} className="w-full">
                  Send Sign-In Link
                </Button>
              </form>
            </>
          )}

          {step === 'check-email' && (
            <>
              <h1 className="font-display text-3xl tracking-[3px] uppercase mb-4 text-center">
                Check Your Email
              </h1>
              <p className="text-white text-sm text-center mb-6 font-body leading-relaxed">
                We&apos;ve sent a sign-in link to <strong>{email}</strong>. Click the link in that email to continue.
              </p>
              <p className="text-[#555] text-xs text-center font-body">
                The link expires in 1 hour. If you don&apos;t see it, check your spam folder.
              </p>
            </>
          )}

          {step === 'set-password' && (
            <>
              <h1 className="font-display text-3xl tracking-[3px] uppercase mb-4 text-center">
                Set Your Password
              </h1>
              <p className="text-white text-sm text-center mb-10 font-body leading-relaxed">
                Create a password to access your DIFW member account.
              </p>
              <form onSubmit={handleSetPassword} className="space-y-8">
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
                  Set Password &amp; Enter Portal
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
