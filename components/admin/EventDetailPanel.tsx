'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { EventSubmission, EventSubmissionStatus } from '@/lib/types'

interface Props {
  submission: EventSubmission
  onClose: () => void
  onStatusChange: (id: string, status: EventSubmissionStatus) => void
  onDelete: (id: string) => void
  onRecover: (id: string) => void
  onUpdate: (updated: EventSubmission) => void
}

type EditState = {
  lead_applicant_name: string
  email: string
  phone: string
  brand_name: string
  website: string
  social_links: string
  practice_description: string
  work_category: string
  work_category_other: string
  event_title: string
  event_type: string
  event_type_other: string
  event_collaboration: string
  collaborators: string
  open_to_alternatives: string
  event_description: string
  event_access: string
  intended_audience: string
  estimated_attendees: string
  event_concept: string
  why_difw26: string
  supporting_materials_url: string
  venue_secured: string
  venue_details: string
  venue_preference: string
  preferred_dates: string[]
  preferred_time: string
  event_duration: string
  technical_requirements: string
  additional_info: string
}

function toEditState(sub: EventSubmission): EditState {
  return {
    lead_applicant_name: sub.lead_applicant_name,
    email: sub.email,
    phone: sub.phone,
    brand_name: sub.brand_name,
    website: sub.website ?? '',
    social_links: sub.social_links ?? '',
    practice_description: sub.practice_description ?? '',
    work_category: sub.work_category ?? '',
    work_category_other: sub.work_category_other ?? '',
    event_title: sub.event_title,
    event_type: sub.event_type,
    event_type_other: sub.event_type_other ?? '',
    event_collaboration: sub.event_collaboration,
    collaborators: sub.collaborators ?? '',
    open_to_alternatives: sub.open_to_alternatives ?? '',
    event_description: sub.event_description ?? '',
    event_access: sub.event_access ?? '',
    intended_audience: sub.intended_audience ?? '',
    estimated_attendees: sub.estimated_attendees ?? '',
    event_concept: sub.event_concept ?? '',
    why_difw26: sub.why_difw26 ?? '',
    supporting_materials_url: sub.supporting_materials_url ?? '',
    venue_secured: sub.venue_secured ?? '',
    venue_details: sub.venue_details ?? '',
    venue_preference: sub.venue_preference ?? '',
    preferred_dates: sub.preferred_dates ?? [],
    preferred_time: sub.preferred_time ?? '',
    event_duration: sub.event_duration ?? '',
    technical_requirements: sub.technical_requirements ?? '',
    additional_info: sub.additional_info ?? '',
  }
}

export function EventDetailPanel({ submission: sub, onClose, onStatusChange, onDelete, onRecover, onUpdate }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editState, setEditState] = useState<EditState>(() => toEditState(sub))

  const isDeleted = !!sub.deleted_at

  async function handleAction(status: EventSubmissionStatus) {
    setLoading(status)
    setError(null)
    try {
      const res = await fetch(`/api/events/${sub.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Action failed')
      onStatusChange(sub.id, status)
    } catch {
      setError('Failed to update status. Try again.')
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete() {
    setLoading('delete')
    setConfirmingDelete(false)
    setError(null)
    try {
      const res = await fetch(`/api/events/${sub.id}/delete`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      onDelete(sub.id)
    } catch {
      setError('Failed to delete. Try again.')
    } finally {
      setLoading(null)
    }
  }

  async function handleRecover() {
    setLoading('recover')
    setError(null)
    try {
      const res = await fetch(`/api/events/${sub.id}/recover`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      onRecover(sub.id)
    } catch {
      setError('Failed to recover. Try again.')
    } finally {
      setLoading(null)
    }
  }

  function handleCancelEdit() {
    setEditState(toEditState(sub))
    setEditing(false)
    setError(null)
  }

  async function handleSave() {
    setLoading('save')
    setError(null)
    try {
      const payload = Object.fromEntries(
        Object.entries(editState).map(([k, v]) => [k, typeof v === 'string' ? (v.trim() || null) : v])
      )
      // preferred_dates is an array, don't trim it
      payload.preferred_dates = editState.preferred_dates

      const res = await fetch(`/api/events/${sub.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Save failed')
      onUpdate({ ...sub, ...payload } as EventSubmission)
      setEditing(false)
    } catch {
      setError('Failed to save changes. Try again.')
    } finally {
      setLoading(null)
    }
  }

  function set(field: keyof EditState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setEditState((p) => ({ ...p, [field]: e.target.value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {!fullscreen && <div className="flex-1 bg-black/60" onClick={editing ? undefined : onClose} />}

      <div className={`bg-black border-l border-[#1a1a1a] overflow-y-auto flex flex-col transition-all ${fullscreen ? 'w-full' : 'w-full max-w-lg'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#1a1a1a] sticky top-0 bg-black z-10">
          <div>
            <p className="font-display text-xl tracking-[2px] uppercase">
              {editing ? editState.lead_applicant_name : sub.lead_applicant_name}
            </p>
            <div className="mt-1">
              {isDeleted ? (
                <span className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#CC0000]">Deleted</span>
              ) : (
                <StatusBadge status={sub.status} />
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFullscreen((f) => !f)}
              className="text-white hover:text-white transition-colors text-2xl font-bold leading-none"
              title={fullscreen ? 'Collapse' : 'Expand'}
            >
              {fullscreen ? '⤡' : '⤢'}
            </button>
            <button
              onClick={editing ? undefined : onClose}
              className={`text-2xl leading-none transition-colors ${editing ? 'text-[#555] cursor-default' : 'text-white hover:text-white'}`}
            >
              ×
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 py-6 border-b border-[#1a1a1a] flex gap-4 flex-wrap">
          {isDeleted ? (
            <Button onClick={handleRecover} loading={loading === 'recover'} disabled={!!loading}>
              Recover
            </Button>
          ) : editing ? (
            <>
              <Button onClick={handleSave} loading={loading === 'save'} disabled={!!loading}>
                Save Changes
              </Button>
              <Button variant="ghost" onClick={handleCancelEdit} disabled={!!loading}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              {sub.status === 'pending' && (
                <>
                  <Button
                    onClick={() => handleAction('accepted')}
                    loading={loading === 'accepted'}
                    disabled={!!loading}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAction('deferred')}
                    loading={loading === 'deferred'}
                    disabled={!!loading}
                  >
                    Defer
                  </Button>
                </>
              )}
              {(sub.status === 'accepted' || sub.status === 'deferred') && (
                <>
                  {sub.status !== 'accepted' && (
                    <Button
                      onClick={() => handleAction('accepted')}
                      loading={loading === 'accepted'}
                      disabled={!!loading}
                    >
                      Accept
                    </Button>
                  )}
                  {sub.status !== 'deferred' && (
                    <Button
                      variant="outline"
                      onClick={() => handleAction('deferred')}
                      loading={loading === 'deferred'}
                      disabled={!!loading}
                    >
                      Defer
                    </Button>
                  )}
                </>
              )}
              <Button variant="outline" onClick={() => setEditing(true)} disabled={!!loading}>
                Edit
              </Button>
              {confirmingDelete ? (
                <>
                  <span className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white self-center">Delete?</span>
                  <Button variant="outline" onClick={handleDelete} loading={loading === 'delete'} disabled={!!loading}>
                    Confirm
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmingDelete(false)} disabled={!!loading}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setConfirmingDelete(true)} disabled={!!loading}>
                  Delete
                </Button>
              )}
            </>
          )}
        </div>

        {error && (
          <div className="px-8 py-4 border-b border-[#1a1a1a]">
            <p className="text-[#CC0000] text-sm">{error}</p>
          </div>
        )}

        {/* Details */}
        <div className="px-8 py-8 space-y-8">
          {editing ? (
            <>
              <Section label="Applicant Information">
                <EditField label="Full Name">
                  <input className="admin-edit-input" value={editState.lead_applicant_name} onChange={set('lead_applicant_name')} />
                </EditField>
                <EditField label="Email">
                  <input className="admin-edit-input" type="email" value={editState.email} onChange={set('email')} />
                </EditField>
                <EditField label="Phone">
                  <input className="admin-edit-input" value={editState.phone} onChange={set('phone')} />
                </EditField>
                <EditField label="Brand / Organisation">
                  <input className="admin-edit-input" value={editState.brand_name} onChange={set('brand_name')} />
                </EditField>
                <EditField label="Website">
                  <input className="admin-edit-input" value={editState.website} onChange={set('website')} placeholder="Optional" />
                </EditField>
                <EditField label="Social Links">
                  <input className="admin-edit-input" value={editState.social_links} onChange={set('social_links')} placeholder="Optional" />
                </EditField>
              </Section>

              <Section label="About Your Practice">
                <EditField label="Practice Description">
                  <textarea className="admin-edit-input resize-none" rows={4} value={editState.practice_description} onChange={set('practice_description')} />
                </EditField>
                <EditField label="Work Category">
                  <input className="admin-edit-input" value={editState.work_category} onChange={set('work_category')} />
                </EditField>
              </Section>

              <Section label="Event Overview">
                <EditField label="Event Title">
                  <input className="admin-edit-input" value={editState.event_title} onChange={set('event_title')} />
                </EditField>
                <EditField label="Event Type">
                  <input className="admin-edit-input" value={editState.event_type} onChange={set('event_type')} />
                </EditField>
                <EditField label="Collaboration">
                  <input className="admin-edit-input" value={editState.event_collaboration} onChange={set('event_collaboration')} />
                </EditField>
                <EditField label="Collaborators">
                  <input className="admin-edit-input" value={editState.collaborators} onChange={set('collaborators')} placeholder="Optional" />
                </EditField>
                <EditField label="Event Description">
                  <textarea className="admin-edit-input resize-none" rows={5} value={editState.event_description} onChange={set('event_description')} />
                </EditField>
                <EditField label="Event Access">
                  <input className="admin-edit-input" value={editState.event_access} onChange={set('event_access')} />
                </EditField>
                <EditField label="Intended Audience">
                  <textarea className="admin-edit-input resize-none" rows={3} value={editState.intended_audience} onChange={set('intended_audience')} />
                </EditField>
                <EditField label="Estimated Attendees">
                  <input className="admin-edit-input" value={editState.estimated_attendees} onChange={set('estimated_attendees')} />
                </EditField>
              </Section>

              <Section label="Creative Concept">
                <EditField label="Event Concept">
                  <textarea className="admin-edit-input resize-none" rows={5} value={editState.event_concept} onChange={set('event_concept')} />
                </EditField>
                <EditField label="Why DIFW26">
                  <textarea className="admin-edit-input resize-none" rows={5} value={editState.why_difw26} onChange={set('why_difw26')} />
                </EditField>
                <EditField label="Supporting Materials URL">
                  <input className="admin-edit-input" value={editState.supporting_materials_url} onChange={set('supporting_materials_url')} placeholder="Optional" />
                </EditField>
              </Section>

              <Section label="Logistics">
                <EditField label="Venue Secured">
                  <input className="admin-edit-input" value={editState.venue_secured} onChange={set('venue_secured')} />
                </EditField>
                <EditField label="Venue Details">
                  <textarea className="admin-edit-input resize-none" rows={3} value={editState.venue_details} onChange={set('venue_details')} placeholder="Optional" />
                </EditField>
                <EditField label="Venue Preference">
                  <textarea className="admin-edit-input resize-none" rows={3} value={editState.venue_preference} onChange={set('venue_preference')} placeholder="Optional" />
                </EditField>
                <EditField label="Preferred Time">
                  <input className="admin-edit-input" value={editState.preferred_time} onChange={set('preferred_time')} />
                </EditField>
                <EditField label="Event Duration">
                  <input className="admin-edit-input" value={editState.event_duration} onChange={set('event_duration')} />
                </EditField>
                <EditField label="Technical Requirements">
                  <textarea className="admin-edit-input resize-none" rows={3} value={editState.technical_requirements} onChange={set('technical_requirements')} placeholder="Optional" />
                </EditField>
              </Section>

              <EditField label="Additional Info">
                <textarea className="admin-edit-input resize-none" rows={4} value={editState.additional_info} onChange={set('additional_info')} placeholder="Optional" />
              </EditField>
            </>
          ) : (
            <>
              <Section label="Applicant Information">
                <Field label="Email">
                  <a href={`mailto:${sub.email}`} className="text-white hover:text-white transition-colors text-sm">{sub.email}</a>
                </Field>
                <Field label="Phone"><span className="text-white text-sm">{sub.phone}</span></Field>
                <Field label="Brand / Organisation"><span className="text-white text-sm">{sub.brand_name}</span></Field>
                {sub.website && <Field label="Website"><a href={sub.website} target="_blank" rel="noopener noreferrer" className="text-white text-sm break-all">{sub.website} ↗</a></Field>}
                {sub.social_links && <Field label="Social Links"><span className="text-white text-sm break-all">{sub.social_links}</span></Field>}
              </Section>

              {(sub.practice_description || sub.work_category) && (
                <Section label="About Their Practice">
                  {sub.practice_description && (
                    <Field label="Practice">
                      <p className="text-white text-sm leading-relaxed font-light">{sub.practice_description}</p>
                    </Field>
                  )}
                  {sub.work_category && (
                    <Field label="Work Category">
                      <span className="text-xs tracking-[2px] uppercase font-ui font-semibold border border-white px-2 py-1 text-white">
                        {sub.work_category}{sub.work_category_other ? ` — ${sub.work_category_other}` : ''}
                      </span>
                    </Field>
                  )}
                </Section>
              )}

              <Section label="Event Overview">
                <Field label="Event Title"><span className="text-white text-sm font-medium">{sub.event_title}</span></Field>
                <Field label="Event Type">
                  <span className="text-xs tracking-[2px] uppercase font-ui font-semibold border border-white px-2 py-1 text-white">
                    {sub.event_type}{sub.event_type_other ? ` — ${sub.event_type_other}` : ''}
                  </span>
                </Field>
                <Field label="Collaboration">
                  <span className="text-white text-sm capitalize">{sub.event_collaboration}</span>
                  {sub.collaborators && <p className="text-white text-sm mt-1">{sub.collaborators}</p>}
                </Field>
                {sub.open_to_alternatives && (
                  <Field label="Open to Alternatives"><span className="text-white text-sm capitalize">{sub.open_to_alternatives}</span></Field>
                )}
                {sub.event_description && (
                  <Field label="Event Description">
                    <p className="text-white text-sm leading-relaxed font-light">{sub.event_description}</p>
                  </Field>
                )}
                {sub.event_access && <Field label="Access"><span className="text-white text-sm">{sub.event_access.replace(/_/g, ' ')}</span></Field>}
                {sub.intended_audience && (
                  <Field label="Intended Audience">
                    <p className="text-white text-sm leading-relaxed font-light">{sub.intended_audience}</p>
                  </Field>
                )}
                {sub.estimated_attendees && <Field label="Est. Attendees"><span className="text-white text-sm">{sub.estimated_attendees}</span></Field>}
              </Section>

              <Section label="Creative Concept">
                {sub.event_concept && (
                  <Field label="Concept">
                    <p className="text-white text-sm leading-relaxed font-light">{sub.event_concept}</p>
                  </Field>
                )}
                {sub.why_difw26 && (
                  <Field label="Why DIFW26">
                    <p className="text-white text-sm leading-relaxed font-light">{sub.why_difw26}</p>
                  </Field>
                )}
                {sub.supporting_materials_url && (
                  <Field label="Supporting Materials">
                    <a
                      href={sub.supporting_materials_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs tracking-[1px] uppercase font-ui text-white border border-white px-3 py-1.5 hover:border-white transition-colors inline-block"
                    >
                      View Materials ↗
                    </a>
                  </Field>
                )}
              </Section>

              <Section label="Logistics">
                {sub.venue_secured && <Field label="Venue Secured"><span className="text-white text-sm capitalize">{sub.venue_secured}</span></Field>}
                {sub.venue_details && (
                  <Field label="Venue Details">
                    <p className="text-white text-sm leading-relaxed font-light">{sub.venue_details}</p>
                  </Field>
                )}
                {sub.venue_preference && (
                  <Field label="Venue Preference">
                    <p className="text-white text-sm leading-relaxed font-light">{sub.venue_preference}</p>
                  </Field>
                )}
                {sub.preferred_dates?.length > 0 && (
                  <Field label="Preferred Dates">
                    <div className="flex flex-wrap gap-2 mt-1">
                      {sub.preferred_dates.map((d) => (
                        <span key={d} className="text-xs tracking-[1px] uppercase font-ui text-white border border-white px-2 py-1">{d}</span>
                      ))}
                    </div>
                  </Field>
                )}
                {sub.preferred_time && <Field label="Preferred Time"><span className="text-white text-sm capitalize">{sub.preferred_time}</span></Field>}
                {sub.event_duration && <Field label="Duration"><span className="text-white text-sm">{sub.event_duration}</span></Field>}
                {sub.technical_requirements && (
                  <Field label="Technical Requirements">
                    <p className="text-white text-sm leading-relaxed font-light">{sub.technical_requirements}</p>
                  </Field>
                )}
              </Section>

              {sub.additional_info && (
                <Field label="Additional Info">
                  <p className="text-white text-sm leading-relaxed font-light">{sub.additional_info}</p>
                </Field>
              )}

              <Field label="Submitted">
                <span className="text-white text-sm">
                  {new Date(sub.created_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </Field>

              {sub.deleted_at && (
                <Field label="Deleted">
                  <span className="text-[#CC0000] text-sm">
                    {new Date(sub.deleted_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </Field>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <p className="text-xs tracking-[3px] uppercase font-ui font-semibold text-[#555] border-b border-[#1a1a1a] pb-2">{label}</p>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white mb-2">{label}</p>
      {typeof children === 'string' ? <p className="text-white text-sm">{children}</p> : children}
    </div>
  )
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#999] mb-2">{label}</p>
      {children}
    </div>
  )
}
