'use client'

import { useState, useRef } from 'react'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { MembershipTier } from '@/lib/types'

const TIERS: { value: MembershipTier; label: string }[] = [
  { value: 'emerging_designer', label: 'Emerging Designer' },
  { value: 'established_designer', label: 'Established Designer' },
  { value: 'signature_designer', label: 'Signature Designer' },
  { value: 'curator', label: 'Curator' },
]

const COMMUNITY_VALUES = [
  {
    title: 'Sustainability & Responsibility',
    body: 'We support circular design, responsible business practices, and creative approaches that contribute to a more sustainable future for fashion and the creative industries.',
  },
  {
    title: 'Community & Collaboration',
    body: 'We believe in strengthening the creative ecosystem through collaboration, knowledge-sharing, and meaningful support for emerging and independent practitioners.',
  },
  {
    title: 'Innovation & Future Thinking',
    body: 'We champion forward-thinking ideas, experimental practices, and creative work that challenges convention and responds to cultural and social change.',
  },
  {
    title: 'Inclusion & Representation',
    body: 'We are committed to building an accessible and inclusive platform where diverse identities, perspectives, and creative backgrounds are welcomed, respected, and represented.',
  },
  {
    title: 'Creative Freedom',
    body: 'DIFW exists to support independent creative expression. We encourage members to develop and present work with originality, authenticity, and full creative ownership.',
  },
]

const IMAGE_TYPES = 'image/jpeg,image/png,image/webp'
const PROOF_TYPES = 'image/jpeg,image/png,image/webp,application/pdf'
const DOCS_TYPES = 'image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/quicktime,video/webm'

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

export function MembershipApplicationForm() {
  const [tier, setTier] = useState<MembershipTier | null>(null)
  const [fields, setFields] = useState({
    full_name: '',
    brand_name: '',
    location: '',
    email: '',
    phone: '',
    instagram: '',
    website_url: '',
    about_work: '',
    why_join: '',
    difw26: '' as '' | 'yes' | 'no' | 'unsure',
    values_agreement: false,
    consent_contact: false,
    consent_profile_sharing: false,
    consent_not_guaranteed: false,
  })
  const [files, setFiles] = useState<{
    headshot: File | null
    logo: File | null
    supporting_docs: File | null
    emerging_proof: File | null
  }>({ headshot: null, logo: null, supporting_docs: null, emerging_proof: null })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: string, value: string | boolean) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  function setFile(key: keyof typeof files, file: File | null) {
    setFiles((prev) => ({ ...prev, [key]: file }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tier) { setError('Please select a membership tier.'); return }
    if (!files.headshot) { setError('Please upload a headshot.'); return }
    if (!files.logo) { setError('Please upload your logo.'); return }
    if (tier === 'emerging_designer' && !files.emerging_proof) {
      setError('Please upload proof of student status or graduation year.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('full_name', fields.full_name)
      formData.append('brand_name', fields.brand_name)
      formData.append('location', fields.location)
      formData.append('email', fields.email)
      formData.append('phone', fields.phone)
      formData.append('instagram', fields.instagram)
      formData.append('website_url', fields.website_url)
      formData.append('membership_tier', tier)
      formData.append('about_work', fields.about_work)
      formData.append('why_join', fields.why_join)
      formData.append('difw26_participation', fields.difw26)
      formData.append('values_agreement', String(fields.values_agreement))
      formData.append('consent_contact', String(fields.consent_contact))
      formData.append('consent_profile_sharing', String(fields.consent_profile_sharing))
      formData.append('consent_not_guaranteed', String(fields.consent_not_guaranteed))
      formData.append('headshot', files.headshot)
      formData.append('logo', files.logo)
      if (files.supporting_docs) formData.append('supporting_docs', files.supporting_docs)
      if (files.emerging_proof) formData.append('emerging_proof', files.emerging_proof)

      const res = await fetch('/api/membership/apply', { method: 'POST', body: formData })
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
          Thank You for Your Application
        </p>
        <p className="text-[#555] max-w-md mx-auto leading-relaxed font-body">
          Applications are reviewed on a rolling basis. You can expect to hear back within 5 business days.
          If you have any questions, please contact{' '}
          <a href="mailto:info@dublin-ifw.com" className="underline hover:text-black transition-colors">
            info@dublin-ifw.com
          </a>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">

      {/* ── Personal Info ── */}
      <Input
        label="Full Name *"
        value={fields.full_name}
        onChange={(e) => set('full_name', e.target.value)}
        required
        placeholder="Your full name"
      />

      <Input
        label="Brand / Organisation Name *"
        value={fields.brand_name}
        onChange={(e) => set('brand_name', e.target.value)}
        required
        placeholder="Your label or organisation"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <Input
          label="Instagram"
          value={fields.instagram}
          onChange={(e) => set('instagram', e.target.value)}
          placeholder="@yourbrand"
        />
        <Input
          label="Website"
          type="url"
          value={fields.website_url}
          onChange={(e) => set('website_url', e.target.value)}
          placeholder="https://"
        />
      </div>

      {/* ── Membership Tier ── */}
      <div>
        <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#555] mb-2">
          Membership Tier *
        </p>
        {/* TODO: hyperlink "click here" to the membership page once built */}
        <p className="text-xs text-[#888] font-body mb-6">
          To read more about each membership tier, click here.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TIERS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTier(t.value)}
              className={`text-left px-6 py-5 border transition-colors ${
                tier === t.value ? 'border-black' : 'border-[#ccc] hover:border-[#888]'
              }`}
            >
              <p
                className={`font-display text-lg tracking-[3px] uppercase ${
                  tier === t.value ? 'text-black' : 'text-[#888]'
                }`}
              >
                {t.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Emerging Designer Eligibility (conditional) ── */}
      {tier === 'emerging_designer' && (
        <div className="border border-[#E5E5E5] p-6 space-y-4">
          <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#555]">
            Emerging Designer Eligibility
          </p>
          <p className="text-sm text-[#555] font-body leading-relaxed">
            Applicants for the Emerging Designer tier must be either a current student, or a graduate within the past 3 years.
          </p>
          <FileInput
            label="Proof of Student Status or Graduation Year"
            hint="PDF or image — max 10MB"
            required
            accept={PROOF_TYPES}
            maxMB={10}
            value={files.emerging_proof}
            onChange={(f) => setFile('emerging_proof', f)}
          />
        </div>
      )}

      {/* ── About Your Practice ── */}
      <Textarea
        label="Please tell us a bit about your work / practice *"
        value={fields.about_work}
        onChange={(e) => set('about_work', e.target.value)}
        required
        rows={5}
        placeholder="Describe your practice, aesthetic, and what you create..."
      />

      <Textarea
        label="Why would you like to be part of Dublin Independent Fashion Week? *"
        value={fields.why_join}
        onChange={(e) => set('why_join', e.target.value)}
        required
        rows={5}
        placeholder="What does DIFW membership mean for you and your work?"
      />

      {/* ── DIFW26 Participation ── */}
      <div>
        <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#555] mb-5">
          Are you planning to take part in DIFW26 (September 10–16, 2026)? *
        </p>
        <div className="flex flex-col gap-3">
          {(['yes', 'no', 'unsure'] as const).map((opt) => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="difw26"
                value={opt}
                checked={fields.difw26 === opt}
                onChange={() => set('difw26', opt)}
                required
                className="w-4 h-4 accent-black flex-shrink-0"
              />
              <span className="text-sm text-[#555] group-hover:text-[#333] transition-colors font-body capitalize">
                {opt === 'yes' ? 'Yes' : opt === 'no' ? 'No' : 'Unsure'}
              </span>
            </label>
          ))}
        </div>

        {(fields.difw26 === 'yes' || fields.difw26 === 'unsure') && (
          <div className="mt-6 border-l-2 border-[#E5E5E5] pl-6 space-y-3">
            <p className="text-sm text-[#555] font-body leading-relaxed">
              Event submissions for DIFW26 will open in <strong>July 2026</strong>, with application forms and deadlines shared through the DIFW Members Portal.
            </p>
            <p className="text-sm text-[#555] font-body leading-relaxed">
              Members intending to take part in DIFW26 will be invited to submit their proposed event, presentation, or activation through this official programming call.
            </p>
            <p className="text-sm text-[#555] font-body leading-relaxed">
              Once confirmed as part of the official DIFW26 programme, participating events will be included across DIFW marketing channels, including the website, social media, and printed materials.
            </p>
            <p className="text-sm text-[#555] font-body leading-relaxed">
              The DIFW team will work collaboratively with members throughout the process to support proposals and help ensure they meet programme and venue requirements to the best of our ability.
            </p>
          </div>
        )}
      </div>

      {/* ── Uploads ── */}
      <div className="space-y-8">
        <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#555]">
          Uploads
        </p>
        <FileInput
          label="Headshot"
          hint="JPG, PNG or WebP — max 10MB"
          required
          accept={IMAGE_TYPES}
          maxMB={10}
          value={files.headshot}
          onChange={(f) => setFile('headshot', f)}
        />
        <FileInput
          label="Logo"
          hint="JPG, PNG or WebP — max 10MB"
          required
          accept={IMAGE_TYPES}
          maxMB={10}
          value={files.logo}
          onChange={(f) => setFile('logo', f)}
        />
        <FileInput
          label="Supporting Documentation"
          hint="PDF, image or video (MP4, MOV, WebM) — max 50MB"
          accept={DOCS_TYPES}
          maxMB={50}
          value={files.supporting_docs}
          onChange={(f) => setFile('supporting_docs', f)}
        />
      </div>

      {/* ── Community Values ── */}
      <div className="border-t border-[#E5E5E5] pt-10 space-y-6">
        <div>
          <p className="font-display text-2xl tracking-[3px] uppercase text-black mb-2">
            Our Community Values
          </p>
          <p className="text-sm text-[#555] font-body leading-relaxed">
            Dublin Independent Fashion Week is built around a shared commitment to supporting an independent, future-focused, and community-led creative industry.
          </p>
          <p className="text-sm text-[#555] font-body leading-relaxed mt-2">
            By becoming a DIFW member, you agree to uphold the following values:
          </p>
        </div>

        <div className="space-y-4">
          {COMMUNITY_VALUES.map((v) => (
            <p key={v.title} className="text-sm text-[#555] font-body leading-relaxed">
              <strong className="text-black font-semibold">{v.title}:</strong> {v.body}
            </p>
          ))}
        </div>

        <p className="text-xs text-[#888] font-body leading-relaxed">
          DIFW reserves the right to revoke membership where actions are found to be in breach of the organisation&apos;s values or community standards.
        </p>

        <label className="flex gap-4 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 accent-black flex-shrink-0 cursor-pointer"
            checked={fields.values_agreement}
            onChange={(e) => set('values_agreement', e.target.checked)}
            required
          />
          <span className="text-sm text-[#555] group-hover:text-[#333] transition-colors leading-relaxed font-body">
            I have read and agree to uphold the values and community principles of Dublin Independent Fashion Week.
          </span>
        </label>
      </div>

      {/* ── Other Agreements ── */}
      <div className="border-t border-[#E5E5E5] pt-8 space-y-5">
        <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#555]">
          Other Agreements
        </p>

        <label className="flex gap-4 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 accent-black flex-shrink-0 cursor-pointer"
            checked={fields.consent_contact}
            onChange={(e) => set('consent_contact', e.target.checked)}
            required
          />
          <span className="text-sm text-[#555] group-hover:text-[#333] transition-colors leading-relaxed font-body">
            I consent to Dublin Independent Fashion Week contacting me regarding membership, events, opportunities, and programme updates.
          </span>
        </label>

        <label className="flex gap-4 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 accent-black flex-shrink-0 cursor-pointer"
            checked={fields.consent_profile_sharing}
            onChange={(e) => set('consent_profile_sharing', e.target.checked)}
            required
          />
          <span className="text-sm text-[#555] group-hover:text-[#333] transition-colors leading-relaxed font-body">
            I understand that, if accepted, certain profile information (such as my name, brand name, discipline, Instagram, website, and uploaded profile image) may be shared within the DIFW Members Portal and member network.
          </span>
        </label>

        <label className="flex gap-4 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 accent-black flex-shrink-0 cursor-pointer"
            checked={fields.consent_not_guaranteed}
            onChange={(e) => set('consent_not_guaranteed', e.target.checked)}
            required
          />
          <span className="text-sm text-[#555] group-hover:text-[#333] transition-colors leading-relaxed font-body">
            I understand that membership applications are reviewed by the DIFW team and acceptance is not guaranteed.
          </span>
        </label>
      </div>

      {/* ── Payment note ── */}
      <div className="border-t border-[#E5E5E5] pt-8">
        <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#555] mb-3">
          Payment
        </p>
        <p className="text-sm text-[#888] font-body leading-relaxed">
          Upon acceptance, applicants will receive a payment link for annual membership dues. Membership is valid for one DIFW programme cycle, including the corresponding annual fashion week and member programming period, and expires on 31 December of the membership year.
        </p>
      </div>

      {error && (
        <p className="text-[#CC0000] text-sm border border-[#CC0000]/30 px-4 py-3">{error}</p>
      )}

      <Button type="submit" variant="dark" loading={loading} className="w-full sm:w-auto">
        Submit Application
      </Button>
    </form>
  )
}
