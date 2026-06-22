'use client'

import { useState, useRef } from 'react'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { createClient } from '@/lib/supabase/client'
import type { ServiceType } from '@/lib/types'

async function uploadFile(bucket: string, file: File, name: string, folder: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const path = `${folder}/${name}.${ext}`

  const res = await fetch('/api/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucket, path }),
  })
  const { token, path: confirmedPath, publicUrl, error } = await res.json()
  if (!res.ok || !token) throw new Error(error ?? 'Failed to get upload URL')

  const supabase = createClient()
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .uploadToSignedUrl(confirmedPath, token, file)
  if (uploadError) throw new Error(uploadError.message)

  return publicUrl
}

const SERVICE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: 'model', label: 'Model' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'content_creator', label: 'Content Creator' },
  { value: 'stylist', label: 'Stylist' },
  { value: 'hair_stylist', label: 'Hair Stylist' },
  { value: 'mua', label: 'Makeup Artist (MUA)' },
  { value: 'production_crew', label: 'Production Crew' },
  { value: 'general_volunteer', label: 'General Volunteer' },
  { value: 'lighting_technician', label: 'Lighting Technician' },
  { value: 'sound_technician', label: 'Sound Technician' },
  { value: 'dj_musician', label: 'DJ / Musician' },
  { value: 'performer', label: 'Performer' },
  { value: 'other', label: 'Other' },
]

const IMAGE_TYPES = 'image/jpeg,image/png,image/webp'
const ANY_TYPES = 'image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/quicktime,video/webm'

function FileInput({
  label,
  hint,
  required,
  accept,
  maxMB,
  value,
  onChange,
}: {
  label: string
  hint?: string
  required?: boolean
  accept: string
  maxMB: number
  value: File | null
  onChange: (file: File | null) => void
}) {
  const ref = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (file && file.size > maxMB * 1024 * 1024) {
      alert(`File must be under ${maxMB}MB`)
      e.target.value = ''
      return
    }
    onChange(file)
  }

  return (
    <div>
      <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#555] mb-2">
        {label}{required && ' *'}
      </p>
      {hint && <p className="text-xs text-[#888] font-body mb-3">{hint}</p>}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="border border-[#ccc] px-4 py-2 text-xs tracking-[2px] uppercase font-ui hover:border-black transition-colors text-[#555] hover:text-black"
        >
          Choose File
        </button>
        <span className="text-sm text-[#888] font-body">
          {value ? value.name : 'No file chosen'}
        </span>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange(null)
              if (ref.current) ref.current.value = ''
            }}
            className="text-xs text-[#999] hover:text-[#CC0000] transition-colors font-ui tracking-[1px] uppercase"
          >
            Remove
          </button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}

export function TalentApplicationForm() {
  const [services, setServices] = useState<ServiceType[]>([])
  const [fields, setFields] = useState({
    full_name: '',
    business_name: '',
    location: '',
    email: '',
    phone: '',
    instagram_website: '',
    services_other: '',
    portfolio_url: '',
    about_me: '',
    consent: false,
  })
  const [files, setFiles] = useState<{ headshot: File | null; supplementary: File | null }>({
    headshot: null,
    supplementary: null,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleService(s: ServiceType) {
    setServices((prev) => {
      if (prev.includes(s)) return prev.filter((x) => x !== s)
      if (prev.length >= 2) return prev
      return [...prev, s]
    })
  }

  function set(key: string, value: string | boolean) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  function setFile(key: keyof typeof files, file: File | null) {
    setFiles((prev) => ({ ...prev, [key]: file }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (services.length === 0) {
      setError('Please select at least one service.')
      return
    }
    if (!files.headshot) {
      setError('Please upload a headshot.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const folder = crypto.randomUUID().slice(0, 8)
      const headshot_url = await uploadFile('talent-uploads', files.headshot, 'headshot', folder)
      const supplementary_url = files.supplementary
        ? await uploadFile('talent-uploads', files.supplementary, 'supplementary', folder)
        : null

      const res = await fetch('/api/talent/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fields.full_name,
          business_name: fields.business_name,
          location: fields.location,
          email: fields.email,
          phone: fields.phone,
          instagram_website: fields.instagram_website,
          services,
          services_other: fields.services_other,
          portfolio_url: fields.portfolio_url,
          about_me: fields.about_me,
          consent: fields.consent,
          headshot_url,
          supplementary_url,
        }),
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
        <p className="font-display text-3xl tracking-[3px] uppercase mb-6 text-black">
          Thank You for Your Submission
        </p>
        <p className="text-[#555] max-w-md mx-auto leading-relaxed font-body">
          Submissions to the Talent Directory are reviewed on a rolling basis. You can expect to hear back within 5 business days.
          If you have any questions, please contact{' '}
          <a href="mailto:info@dublin-ifw.com" className="underline hover:text-black transition-colors">
            info@dublin-ifw.com
          </a>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-10">

      {/* ── Personal Info ── */}
      <Input
        label="Full Name *"
        value={fields.full_name}
        onChange={(e) => set('full_name', e.target.value)}
        required
        placeholder="Your full name"
      />

      <Input
        label="Brand / Organisation Name"
        value={fields.business_name}
        onChange={(e) => set('business_name', e.target.value)}
        placeholder="If applicable"
      />

      <Input
        label="Location *"
        value={fields.location}
        onChange={(e) => set('location', e.target.value)}
        required
        placeholder="City, Country"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <Input
          label="Email Address *"
          type="email"
          value={fields.email}
          onChange={(e) => set('email', e.target.value)}
          required
          placeholder="you@example.com"
        />
        <Input
          label="Phone Number *"
          type="tel"
          value={fields.phone}
          onChange={(e) => set('phone', e.target.value)}
          required
          placeholder="+353 87 000 0000"
        />
      </div>

      <Input
        label="Instagram / Website"
        value={fields.instagram_website}
        onChange={(e) => set('instagram_website', e.target.value)}
        placeholder="@yourbrand or https://yourwebsite.com"
      />

      {/* ── Services ── */}
      <div>
        <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#555] mb-2">
          Services *
        </p>
        <p className="text-sm text-[#555] font-body mb-4 leading-relaxed">
          Please select the skill that best represents your primary area of practice, and is most clearly reflected in your portfolio and supporting materials.<br /><br />
          If you work across multiple disciplines, you may submit additional applications with separate portfolios relevant to each skill.
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
              label="If you selected Other, please elaborate"
              value={fields.services_other}
              onChange={(e) => set('services_other', e.target.value)}
              placeholder="Describe your service"
            />
          </div>
        )}
      </div>

      {/* ── Links / Uploads ── */}
      <div className="space-y-8">
        <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#555]">
          Links / Uploads
        </p>

        <div>
          <Input
            label="Portfolio Link *"
            type="text"
            value={fields.portfolio_url}
            onChange={(e) => set('portfolio_url', e.target.value)}
            required
            placeholder="https://"
          />
          <p className="text-xs text-[#888] font-body mt-2">Make sure your link starts with https:// and is publicly accessible — not set to private or login-required.</p>
        </div>

        <FileInput
          label="Headshot"
          hint="JPG, PNG or WebP — max 10MB. If submitting from a phone, consider emailing the photo to yourself first and compressing it before uploading."
          required
          accept={IMAGE_TYPES}
          maxMB={10}
          value={files.headshot}
          onChange={(f) => setFile('headshot', f)}
        />

        <FileInput
          label="Supplementary Material"
          hint="Upload any additional portfolio material — image, PDF or video, max 50MB"
          accept={ANY_TYPES}
          maxMB={50}
          value={files.supplementary}
          onChange={(f) => setFile('supplementary', f)}
        />
      </div>

      {/* ── About Me ── */}
      <Textarea
        label="About Me *"
        value={fields.about_me}
        onChange={(e) => set('about_me', e.target.value)}
        required
        rows={6}
        placeholder="Tell us about your creative practice, experience, and the type of work you're interested in. This section, alongside your portfolio, is an important part of your application, as it will be shared with DIFW members when selecting creatives to collaborate with."
      />

      {/* ── Agreement ── */}
      <div className="border-t border-[#E5E5E5] pt-8">
        <label className="flex gap-4 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 accent-black flex-shrink-0 cursor-pointer"
            checked={fields.consent}
            onChange={(e) => set('consent', e.target.checked)}
            required
          />
          <span className="text-sm text-[#555] group-hover:text-[#333] transition-colors leading-relaxed font-body">
            By submitting this form, you consent to DIFW sharing your details and portfolio with members for collaboration opportunities, and to using your profile, portfolio, and related content in promotional materials, presentations, and marketing activities connected to the DIFW Talent Directory.
          </span>
        </label>
      </div>

      {error && (
        <p className="text-[#CC0000] text-sm border border-[#CC0000]/30 px-4 py-3">{error}</p>
      )}

      <Button type="submit" variant="dark" loading={loading} className="w-full sm:w-auto">
        Submit
      </Button>
    </form>
  )
}
