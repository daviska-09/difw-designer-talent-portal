'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type Step = 'loading' | 'set-password' | 'error'

function SetupContent() {
  const router = useRouter()
  const params = useSearchParams()
  const errorParam = params.get('error')

  const [step, setStep] = useState<Step>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (errorParam === 'wrong-account') {
      setStep('error')
      setError('This setup link is for a different account. Please log out before using it.')
      return
    }
    if (errorParam === 'invalid') {
      setStep('error')
      return
    }
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setStep(data.session ? 'set-password' : 'error')
    })
  }, [errorParam])

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
    <>
      {step === 'loading' && null}

      {step === 'error' && (
        <>
          <h1 className="font-display text-3xl tracking-[3px] uppercase mb-4 text-center">
            {errorParam === 'wrong-account' ? 'Wrong Account' : 'Link Expired'}
          </h1>
          <p className="text-white text-sm text-center mb-8 font-body leading-relaxed">
            {error ?? 'This setup link is invalid or has expired. Please contact us at info@dublin-ifw.com to request a new one.'}
          </p>
          <Button onClick={() => router.push('/login')} className="w-full">
            Go to Login
          </Button>
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
    </>
  )
}

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <p className="text-xs tracking-[3px] uppercase font-ui font-semibold text-white mb-3 text-center">
            DIFW Portal
          </p>
          <Suspense>
            <SetupContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
