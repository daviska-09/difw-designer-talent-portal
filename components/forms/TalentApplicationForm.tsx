'use client'

import { useState } from 'react'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import type { ServiceType } from '@/lib/types'

const SERVICE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: 'photographer', label: 'Photographer' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'model', label: 'Model' },
  { value: 'stylist', label: 'Stylist' },
  { value: 'mua', label: 'MUA' },
  { value: 'other', label: 'Other' },
]

export function TalentApplicationForm() {
  const [services, setServices] = useState<ServiceType[]>([])
  const [fields, setFields] = useState({
    first_name: '',
    last_name: '',
    business_name: '',
    email: '',
    phone: '',
    services_other: '',
    portfolio_url: '',
    supplementary_url: '',
    about_me: '',
    consent: false,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleService(s: ServiceType) {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  function set(key: string, value: string | boolean) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/talent/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, services }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Submission failed')
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-3xl tracking-[3px] uppercase mb-6 text-black">Application Received</p>
        <p className="text-[#666] max-w-md mx-auto">
          Thanks for applying to the DIFW Talent Database. A member of our team will review your application and be in touch shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <Input
          label="First Name *"
          value={fields.first_name}
          onChange={(e) => set('first_name', e.target.value)}
          required
          placeholder="Aoife"
        />
        <Input
          label="Last Name *"
          value={fields.last_name}
          onChange={(e) => set('last_name', e.target.value)}
          required
          placeholder="Murphy"
        />
      </div>

      <Input
        label="Business / Studio Name"
        value={fields.business_name}
        onChange={(e) => set('business_name', e.target.value)}
        placeholder="Optional"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <Input
          label="Email *"
          type="email"
          value={fields.email}
          onChange={(e) => set('email', e.target.value)}
          required
          placeholder="you@example.com"
        />
        <Input
          label="Phone"
          type="tel"
          value={fields.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="+353 87 000 0000"
        />
      </div>

      {/* Services */}
      <div>
        <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#555] mb-4">
          Services Offered *
        </p>
        <div className="flex flex-wrap gap-3">
          {SERVICE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              active={services.includes(opt.value)}
              light
              onClick={() => toggleService(opt.value)}
            />
          ))}
        </div>

        {services.includes('other') && (
          <div className="mt-6">
            <Input
              label="Please Elaborate"
              value={fields.services_other}
              onChange={(e) => set('services_other', e.target.value)}
              placeholder="Describe your service"
            />
          </div>
        )}
      </div>

      <Input
        label="Portfolio Link"
        type="url"
        value={fields.portfolio_url}
        onChange={(e) => set('portfolio_url', e.target.value)}
        placeholder="https://yourportfolio.com"
      />

      <Input
        label="Supplementary Material"
        type="url"
        value={fields.supplementary_url}
        onChange={(e) => set('supplementary_url', e.target.value)}
        placeholder="Google Drive / Dropbox / WeTransfer link"
      />

      <Textarea
        label="About Me *"
        hint="Write something that helps our members understand your work and how you collaborate."
        value={fields.about_me}
        onChange={(e) => set('about_me', e.target.value)}
        required
        rows={6}
        placeholder="Tell us about your practice, your approach, and the kinds of projects you love..."
      />

      <div className="border-t border-[#E5E5E5] pt-8">
        <label className="flex gap-4 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 accent-black flex-shrink-0 cursor-pointer"
            checked={fields.consent}
            onChange={(e) => set('consent', e.target.checked)}
            required
          />
          <span className="text-sm text-[#555] group-hover:text-[#333] transition-colors leading-relaxed">
            By submitting this form, you confirm that you are happy for DIFW to share your details and portfolio with our members for the purpose of collaboration opportunities.
          </span>
        </label>
      </div>

      {error && (
        <p className="text-[#CC0000] text-sm border border-[#CC0000] border-opacity-30 px-4 py-3">{error}</p>
      )}

      <Button type="submit" variant="dark" loading={loading} className="w-full sm:w-auto">
        Submit Application
      </Button>
    </form>
  )
}
