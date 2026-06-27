'use client'

import { useState, useRef } from 'react'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

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

const WORK_CATEGORIES = [
  'Fashion Design', 'Textile Design', 'Accessories', 'Jewellery', 'Footwear',
  'Styling', 'Creative Direction', 'Photography', 'Film / Content Creation',
  'Hair', 'Makeup', 'Modelling', 'Performance', 'Music / DJ',
  'Production / Event Management', 'Retail', 'Education', 'Community Organisation', 'Other',
]

const EVENT_TYPES = [
  'Runway Show', 'Presentation', 'Showroom', 'Pop-Up', 'Exhibition',
  'Workshop', 'Panel Discussion', 'Networking Event', 'Performance',
  'Screening', 'Installation', 'Other',
]

const EVENT_DATES = [
  { value: '10 September 2026', label: 'Wednesday 10 September 2026' },
  { value: '11 September 2026', label: 'Thursday 11 September 2026' },
  { value: '12 September 2026', label: 'Friday 12 September 2026' },
  { value: '13 September 2026', label: 'Saturday 13 September 2026' },
  { value: '14 September 2026', label: 'Sunday 14 September 2026' },
  { value: '15 September 2026', label: 'Monday 15 September 2026' },
  { value: '16 September 2026', label: 'Tuesday 16 September 2026' },
]

const AUDIENCE_OPTIONS = [
  'General Public',
  'Industry Professionals',
  'Students & Emerging Creatives',
  'Existing Customers / Community',
  'Mixed Audience',
]

const DOCS_TYPES = 'image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/quicktime,video/webm'

const KEY_DATES = [
  { date: '27 July 2026', detail: 'Submission Deadline' },
  { date: '28 July – 2 August 2026', detail: 'DIFW26 Curation Committee Review Period' },
  { date: '3 August 2026', detail: 'Acceptance and Deferral Notifications Issued' },
  {
    date: 'August 2026',
    detail: 'Approved Applicants: Design and promotional asset production begins\nDeferred Applicants: Development support provided by the DIFW26 Curation Committee',
  },
  { date: '1 September 2026', detail: 'Deadline for all final event information, graphics, and promotional materials' },
]

function FieldLabel({ label, required, hint }: { label: string; required?: boolean; hint?: string }) {
  return (
    <div className="mb-3">
      <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#555]">
        {label}{required && ' *'}
      </p>
      {hint && <p className="text-xs text-[#888] font-body mt-1">{hint}</p>}
    </div>
  )
}

function SquareIndicator({ checked, type = 'radio' }: { checked: boolean; type?: 'radio' | 'checkbox' }) {
  return (
    <div className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-colors ${
      checked ? 'border-black bg-black' : 'border-black bg-white'
    }`}>
      {checked && type === 'radio' && (
        <div className="w-1.5 h-1.5 bg-white" />
      )}
      {checked && type === 'checkbox' && (
        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )
}

function RadioGroup({
  label, required, hint, name, options, value, onChange,
}: {
  label: string
  required?: boolean
  hint?: string
  name: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <FieldLabel label={label} required={required} hint={hint} />
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                className="absolute inset-0 opacity-0 w-4 h-4 cursor-pointer"
              />
              <SquareIndicator checked={value === opt.value} type="radio" />
            </div>
            <span className="text-sm text-[#555] group-hover:text-[#333] transition-colors font-body leading-relaxed">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

function SquareCheckboxField({
  label, checked, onChange,
}: {
  label: React.ReactNode
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex gap-4 cursor-pointer group">
      <div className="relative flex-shrink-0 mt-1">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="absolute inset-0 opacity-0 w-4 h-4 cursor-pointer"
        />
        <SquareIndicator checked={checked} type="checkbox" />
      </div>
      <span className="text-sm text-[#555] group-hover:text-[#333] transition-colors leading-relaxed font-body">
        {label}
      </span>
    </label>
  )
}

function FileInput({
  label, hint, required, accept, maxMB, value, onChange,
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
      <FieldLabel label={label} required={required} hint={hint} />
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
            onClick={() => { onChange(null); if (ref.current) ref.current.value = '' }}
            className="text-xs text-[#999] hover:text-[#CC0000] transition-colors font-ui tracking-[1px] uppercase"
          >
            Remove
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={handleChange} />
    </div>
  )
}

export function EventSubmissionForm() {
  const [fields, setFields] = useState({
    lead_applicant_name: '',
    email: '',
    phone: '',
    brand_name: '',
    website: '',
    social_links: '',
    practice_description: '',
    work_category: '',
    work_category_other: '',
    event_title: '',
    event_type: '',
    event_type_other: '',
    event_collaboration: '',
    collaborators: '',
    open_to_alternatives: '',
    event_description: '',
    event_access: '',
    intended_audience: '',
    estimated_attendees: '',
    event_concept: '',
    why_difw26: '',
    venue_secured: '',
    venue_details: '',
    venue_preference: '',
    preferred_time: '',
    event_duration: '',
    technical_requirements: '',
    additional_info: '',
  })
  const [preferredDates, setPreferredDates] = useState<string[]>([])
  const [confirmAccurate, setConfirmAccurate] = useState(false)
  const [confirmNotGuaranteed, setConfirmNotGuaranteed] = useState(false)
  const [confirmDeadline, setConfirmDeadline] = useState(false)
  const [supportingFile, setSupportingFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  function toggleDate(date: string) {
    setPreferredDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!confirmAccurate || !confirmNotGuaranteed || !confirmDeadline) {
      setError('Please check all declaration boxes before submitting.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const folder = crypto.randomUUID().slice(0, 8)
      const supporting_materials_url = supportingFile
        ? await uploadFile('event-uploads', supportingFile, 'supporting_materials', folder)
        : null
      const res = await fetch('/api/events/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fields,
          preferred_dates: preferredDates,
          confirm_accurate: confirmAccurate,
          confirm_not_guaranteed: confirmNotGuaranteed,
          confirm_deadline: confirmDeadline,
          supporting_materials_url,
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
        <p className="text-[#555] max-w-md mx-auto leading-relaxed font-body mb-4">
          Applications will be reviewed on a rolling basis. All applicants will receive an outcome no later than{' '}
          <strong className="text-black">3 August 2026</strong>.
        </p>
        <p className="text-[#555] max-w-md mx-auto leading-relaxed font-body">
          If you have any questions in the meantime, please contact{' '}
          <a href="mailto:info@dublin-ifw.com" className="underline hover:text-black transition-colors">
            info@dublin-ifw.com
          </a>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-10">

      {/* ── Intro ── */}
      <div className="space-y-4">
        <p className="text-sm text-[#333] font-body leading-relaxed">
          Thank you for your interest in participating in Dublin Independent Fashion Week 2026!
        </p>
        <p className="text-sm text-[#555] font-body leading-relaxed">
          This form is for DIFW Members wishing to propose an activity for inclusion in the DIFW26 programme (10–16 September 2026).
        </p>
        <p className="text-sm text-[#555] font-body leading-relaxed">
          All submissions will be reviewed by the DIFW26 Curation Committee. Applications will either be{' '}
          <strong className="text-black">Accepted</strong> or{' '}
          <strong className="text-black">Deferred for Further Development</strong>. A deferred application is not a rejection and simply means that further development is required before the proposal can be included in the programme.
        </p>
        <p className="text-xs text-[#888] font-body tracking-[1px]">
          Most applications will take approximately 15–20 minutes to complete.
        </p>
      </div>

      {/* ── Section 1: Applicant Information ── */}
      <div className="border-t border-[#E5E5E5] pt-10 space-y-8">
        <div>
          <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#888] mb-1">Section 1</p>
          <p className="font-display text-2xl tracking-[3px] uppercase text-black mb-3">
            Applicant Information
          </p>
          <p className="text-sm text-[#555] font-body leading-relaxed">
            For collaborative projects, collectives, and organisations, please submit one application per proposed event. The lead applicant should act as the primary point of contact throughout the review process.
          </p>
        </div>

        <Input
          label="Lead Applicant Full Name *"
          value={fields.lead_applicant_name}
          onChange={(e) => set('lead_applicant_name', e.target.value)}
          required
          placeholder="Your full name"
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
          label="Brand, Organisation, Collective, or Project Name *"
          value={fields.brand_name}
          onChange={(e) => set('brand_name', e.target.value)}
          required
          placeholder="Your brand or organisation"
        />

        <Input
          label="Website"
          value={fields.website}
          onChange={(e) => set('website', e.target.value)}
          placeholder="https://"
        />

        <Textarea
          label="Social Media, Portfolio, or Other Relevant Links"
          hint="Instagram, TikTok, LinkedIn, portfolio website, etc."
          value={fields.social_links}
          onChange={(e) => set('social_links', e.target.value)}
          rows={3}
          placeholder="@yourbrand, https://yourportfolio.com, ..."
        />
      </div>

      {/* ── Section 2: About Your Practice ── */}
      <div className="border-t border-[#E5E5E5] pt-10 space-y-8">
        <div>
          <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#888] mb-1">Section 2</p>
          <p className="font-display text-2xl tracking-[3px] uppercase text-black">
            About Your Practice
          </p>
        </div>

        <Textarea
          label="Please provide a short description of your brand, creative practice, organisation, or project *"
          hint="Max 250 words"
          value={fields.practice_description}
          onChange={(e) => set('practice_description', e.target.value)}
          required
          rows={6}
          placeholder="Describe your practice, work, or organisation..."
        />

        <RadioGroup
          label="Which category best describes your work?"
          required
          name="work_category"
          options={WORK_CATEGORIES.map((c) => ({ value: c, label: c }))}
          value={fields.work_category}
          onChange={(v) => set('work_category', v)}
        />

        {fields.work_category === 'Other' && (
          <Input
            label="If you chose Other, please describe your work category *"
            value={fields.work_category_other}
            onChange={(e) => set('work_category_other', e.target.value)}
            required
            placeholder="Describe your work category"
          />
        )}
      </div>

      {/* ── Section 3: Event Overview ── */}
      <div className="border-t border-[#E5E5E5] pt-10 space-y-8">
        <div>
          <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#888] mb-1">Section 3</p>
          <p className="font-display text-2xl tracking-[3px] uppercase text-black">
            Event Overview
          </p>
        </div>

        <Input
          label="Event Title *"
          value={fields.event_title}
          onChange={(e) => set('event_title', e.target.value)}
          required
          placeholder="The name of your proposed event"
        />

        <RadioGroup
          label="What type of event are you proposing?"
          required
          name="event_type"
          options={EVENT_TYPES.map((t) => ({ value: t, label: t }))}
          value={fields.event_type}
          onChange={(v) => set('event_type', v)}
        />

        {fields.event_type === 'Other' && (
          <Input
            label="If you chose Other, please explain *"
            value={fields.event_type_other}
            onChange={(e) => set('event_type_other', e.target.value)}
            required
            placeholder="Describe your event type"
          />
        )}

        <RadioGroup
          label="Is this event:"
          required
          name="event_collaboration"
          options={[
            { value: 'solo', label: 'Solo' },
            { value: 'collaborative', label: 'Collaborative' },
          ]}
          value={fields.event_collaboration}
          onChange={(v) => set('event_collaboration', v)}
        />

        {fields.event_collaboration === 'collaborative' && (
          <Textarea
            label="If collaborative, please list any confirmed collaborators"
            hint="All collaborators must hold an active DIFW Membership to be individually listed in official DIFW26 materials."
            value={fields.collaborators}
            onChange={(e) => set('collaborators', e.target.value)}
            rows={4}
            placeholder="List confirmed collaborators..."
          />
        )}

        <RadioGroup
          label="If your proposal requires further development before inclusion in the programme, would you be open to exploring alternative participation opportunities with DIFW?"
          required
          name="open_to_alternatives"
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No, I only wish to be considered for this specific proposal' },
          ]}
          value={fields.open_to_alternatives}
          onChange={(v) => set('open_to_alternatives', v)}
        />

        <Textarea
          label="Please provide a short event description for public-facing use *"
          hint="Max 150 words"
          value={fields.event_description}
          onChange={(e) => set('event_description', e.target.value)}
          required
          rows={5}
          placeholder="A brief description of your event as it would appear in the DIFW26 programme..."
        />

        <RadioGroup
          label="Will this event be:"
          required
          name="event_access"
          options={[
            { value: 'public_free', label: 'Public and Free' },
            { value: 'public_ticketed', label: 'Public and Ticketed' },
            { value: 'invite_only', label: 'Invite Only' },
            { value: 'mixed', label: 'Mixed Format' },
          ]}
          value={fields.event_access}
          onChange={(v) => set('event_access', v)}
        />

        <RadioGroup
          label="Who is this event primarily intended for?"
          required
          name="intended_audience"
          options={AUDIENCE_OPTIONS.map((a) => ({ value: a, label: a }))}
          value={fields.intended_audience}
          onChange={(v) => set('intended_audience', v)}
        />

        <Input
          label="Estimated Number of Attendees *"
          value={fields.estimated_attendees}
          onChange={(e) => set('estimated_attendees', e.target.value)}
          required
          placeholder="e.g. 50, 100–200"
        />
      </div>

      {/* ── Section 4: Creative Concept ── */}
      <div className="border-t border-[#E5E5E5] pt-10 space-y-8">
        <div>
          <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#888] mb-1">Section 4</p>
          <p className="font-display text-2xl tracking-[3px] uppercase text-black">
            Creative Concept
          </p>
        </div>

        <Textarea
          label="Describe your proposed event *"
          hint="Include what attendees will experience, what you plan to showcase, and the primary objectives of the event. Max 500 words."
          value={fields.event_concept}
          onChange={(e) => set('event_concept', e.target.value)}
          required
          rows={10}
          placeholder="Describe what attendees will experience, what you plan to showcase, and the primary objectives..."
        />

        <Textarea
          label="Why do you believe this proposal is a good fit for DIFW26? *"
          hint="Max 200 words"
          value={fields.why_difw26}
          onChange={(e) => set('why_difw26', e.target.value)}
          required
          rows={6}
          placeholder="Explain why this proposal is a good fit for DIFW26..."
        />

        <FileInput
          label="Supporting Materials"
          hint="Lookbooks, moodboards, renderings, decks, images, or video — PDF, image or video (MP4, MOV, WebM) — max 50MB"
          accept={DOCS_TYPES}
          maxMB={50}
          value={supportingFile}
          onChange={setSupportingFile}
        />
      </div>

      {/* ── Section 5: Logistics ── */}
      <div className="border-t border-[#E5E5E5] pt-10 space-y-8">
        <div>
          <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#888] mb-1">Section 5</p>
          <p className="font-display text-2xl tracking-[3px] uppercase text-black">
            Logistics
          </p>
        </div>

        <RadioGroup
          label="Do you already have a venue secured?"
          required
          name="venue_secured"
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
          value={fields.venue_secured}
          onChange={(v) => set('venue_secured', v)}
        />

        {fields.venue_secured === 'yes' && (
          <Textarea
            label="If yes, please provide the venue name and any relevant details"
            value={fields.venue_details}
            onChange={(e) => set('venue_details', e.target.value)}
            rows={3}
            placeholder="Venue name, address, capacity, etc."
          />
        )}

        {fields.venue_secured === 'no' && (
          <Textarea
            label="If no, do you have a venue or area of Dublin in mind?"
            value={fields.venue_preference}
            onChange={(e) => set('venue_preference', e.target.value)}
            rows={3}
            placeholder="Area of Dublin or any venue preferences..."
          />
        )}

        <div>
          <FieldLabel label="Preferred Event Date(s)" hint="Select all that apply: 10–16 September 2026" />
          <div className="flex flex-col gap-3">
            {EVENT_DATES.map((date) => (
              <label key={date.value} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={preferredDates.includes(date.value)}
                    onChange={() => toggleDate(date.value)}
                    className="absolute inset-0 opacity-0 w-4 h-4 cursor-pointer"
                  />
                  <SquareIndicator checked={preferredDates.includes(date.value)} type="checkbox" />
                </div>
                <span className="text-sm text-[#555] group-hover:text-[#333] transition-colors font-body">
                  {date.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <RadioGroup
          label="Preferred Time of Day"
          required
          name="preferred_time"
          options={[
            { value: 'morning', label: 'Morning (8:00am–12:00pm)' },
            { value: 'afternoon', label: 'Afternoon (12:00pm–5:00pm)' },
            { value: 'evening', label: 'Evening (5:00pm–10:00pm)' },
            { value: 'flexible', label: 'Flexible' },
          ]}
          value={fields.preferred_time}
          onChange={(v) => set('preferred_time', v)}
        />

        <Input
          label="Estimated Event Duration *"
          value={fields.event_duration}
          onChange={(e) => set('event_duration', e.target.value)}
          required
          placeholder="e.g. 1 hour, 3 hours, all day, multi-day"
        />

        <Textarea
          label="Venue, production, accessibility, or technical requirements"
          hint="Optional"
          value={fields.technical_requirements}
          onChange={(e) => set('technical_requirements', e.target.value)}
          rows={4}
          placeholder="Any requirements we should be aware of..."
        />
      </div>

      {/* ── Final Declaration ── */}
      <div className="border-t border-[#E5E5E5] pt-10 space-y-6">
        <p className="font-display text-2xl tracking-[3px] uppercase text-black">
          Final Declaration
        </p>

        <SquareCheckboxField
          label="I confirm that the information provided in this application is accurate."
          checked={confirmAccurate}
          onChange={setConfirmAccurate}
        />

        <SquareCheckboxField
          label="I understand that submission does not guarantee inclusion in the DIFW26 programme and that DIFW may request further development of my proposal before a final decision is made."
          checked={confirmNotGuaranteed}
          onChange={setConfirmNotGuaranteed}
        />

        <SquareCheckboxField
          label={<>If accepted, I agree to submit all final event information and promotional materials by <strong className="text-black">1 September 2026</strong>.</>}
          checked={confirmDeadline}
          onChange={setConfirmDeadline}
        />

        <Textarea
          label="Is there anything else you would like the DIFW team to know?"
          hint="Optional"
          value={fields.additional_info}
          onChange={(e) => set('additional_info', e.target.value)}
          rows={4}
          placeholder="Any additional information for the DIFW team..."
        />
      </div>

      {/* ── What Happens Next ── */}
      <div className="border-t border-[#E5E5E5] pt-10 space-y-6">
        <p className="font-display text-2xl tracking-[3px] uppercase text-black">
          What Happens Next?
        </p>
        <p className="text-sm text-[#555] font-body leading-relaxed">
          Applications will be reviewed on a rolling basis. All applicants will receive an outcome no later than{' '}
          <strong className="text-black">3 August 2026</strong>.
        </p>

        <div>
          <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#888] mb-5">
            Key Dates
          </p>
          <div className="space-y-4">
            {KEY_DATES.map((item) => (
              <div key={item.date} className="flex gap-6">
                <p className="text-xs text-[#888] font-ui tracking-[1px] uppercase min-w-[160px] leading-relaxed pt-0.5 flex-shrink-0">
                  {item.date}
                </p>
                <p className="text-sm text-[#555] font-body leading-relaxed whitespace-pre-line">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-[#888] font-body leading-relaxed">
          Thank you for submitting your proposal and for being part of DIFW26. We look forward to reviewing your application.
        </p>
      </div>

      {error && (
        <p className="text-[#CC0000] text-sm border border-[#CC0000]/30 px-4 py-3">{error}</p>
      )}

      <Button type="submit" variant="dark" loading={loading} className="w-full sm:w-auto">
        Submit Proposal
      </Button>
    </form>
  )
}
