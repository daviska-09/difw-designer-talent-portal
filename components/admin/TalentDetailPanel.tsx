'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { TalentApplication, ServiceType } from '@/lib/types'

const SERVICE_LABELS: Record<string, string> = {
  model: 'Model',
  photographer: 'Photographer',
  videographer: 'Videographer',
  content_creator: 'Content Creator',
  stylist: 'Stylist',
  hair_stylist: 'Hair Stylist',
  mua: 'MUA',
  production_crew: 'Production Crew',
  backstage_assistant: 'Backstage Assistant',
  lighting_technician: 'Lighting Technician',
  sound_technician: 'Sound Technician',
  dj_musician: 'DJ / Musician',
  performer: 'Performer',
  other: 'Other',
}

const ALL_SERVICES = Object.keys(SERVICE_LABELS) as ServiceType[]

interface Props {
  application: TalentApplication
  onClose: () => void
  onStatusChange: (id: string, status: 'approved' | 'rejected') => void
  onDelete: (id: string) => void
  onRecover: (id: string) => void
  onUpdate: (updated: TalentApplication) => void
}

interface EditState {
  full_name: string
  business_name: string
  location: string
  email: string
  phone: string
  instagram_website: string
  services: ServiceType[]
  services_other: string
  portfolio_url: string
  headshot_url: string
  supplementary_url: string
  about_me: string
}

function toEditState(app: TalentApplication): EditState {
  return {
    full_name: app.full_name,
    business_name: app.business_name ?? '',
    location: app.location,
    email: app.email,
    phone: app.phone ?? '',
    instagram_website: app.instagram_website ?? '',
    services: app.services ?? [],
    services_other: app.services_other ?? '',
    portfolio_url: app.portfolio_url ?? '',
    headshot_url: app.headshot_url,
    supplementary_url: app.supplementary_url ?? '',
    about_me: app.about_me,
  }
}

export function TalentDetailPanel({ application: app, onClose, onStatusChange, onDelete, onRecover, onUpdate }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editState, setEditState] = useState<EditState>(() => toEditState(app))

  const isDeleted = !!app.deleted_at

  async function handleAction(status: 'approved' | 'rejected') {
    setLoading(status)
    setError(null)
    try {
      const res = await fetch(`/api/talent/${app.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Action failed')
      onStatusChange(app.id, status)
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
      const res = await fetch(`/api/talent/${app.id}/delete`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      onDelete(app.id)
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
      const res = await fetch(`/api/talent/${app.id}/recover`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      onRecover(app.id)
    } catch {
      setError('Failed to recover. Try again.')
    } finally {
      setLoading(null)
    }
  }

  function handleCancelEdit() {
    setEditState(toEditState(app))
    setEditing(false)
    setError(null)
  }

  async function handleSave() {
    setLoading('save')
    setError(null)
    try {
      const payload = {
        full_name: editState.full_name.trim(),
        business_name: editState.business_name.trim() || null,
        location: editState.location.trim(),
        email: editState.email.trim(),
        phone: editState.phone.trim() || null,
        instagram_website: editState.instagram_website.trim() || null,
        services: editState.services,
        services_other: editState.services_other.trim() || null,
        portfolio_url: editState.portfolio_url.trim() || null,
        headshot_url: editState.headshot_url.trim(),
        supplementary_url: editState.supplementary_url.trim() || null,
        about_me: editState.about_me.trim(),
      }
      const res = await fetch(`/api/talent/${app.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Save failed')
      onUpdate({ ...app, ...payload })
      setEditing(false)
    } catch {
      setError('Failed to save changes. Try again.')
    } finally {
      setLoading(null)
    }
  }

  function toggleService(s: ServiceType) {
    setEditState((prev) => ({
      ...prev,
      services: prev.services.includes(s)
        ? prev.services.filter((x) => x !== s)
        : [...prev.services, s],
    }))
  }

  const name = editing ? editState.full_name : app.full_name

  return (
    <div className="fixed inset-0 z-50 flex">
      {!fullscreen && <div className="flex-1 bg-black/60" onClick={editing ? undefined : onClose} />}

      <div className={`bg-black border-l border-[#1a1a1a] overflow-y-auto flex flex-col transition-all ${fullscreen ? 'w-full' : 'w-full max-w-lg'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#1a1a1a] sticky top-0 bg-black z-10">
          <div>
            <p className="font-display text-xl tracking-[2px] uppercase">{name}</p>
            <div className="mt-1">
              {isDeleted ? (
                <span className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#CC0000]">Deleted</span>
              ) : (
                <StatusBadge status={app.status as 'pending' | 'approved' | 'rejected'} />
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
              {app.status === 'pending' && (
                <>
                  <Button
                    onClick={() => handleAction('approved')}
                    loading={loading === 'approved'}
                    disabled={!!loading}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAction('rejected')}
                    loading={loading === 'rejected'}
                    disabled={!!loading}
                  >
                    Reject
                  </Button>
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
              <EditField label="Full Name">
                <input
                  className="admin-edit-input"
                  value={editState.full_name}
                  onChange={(e) => setEditState((p) => ({ ...p, full_name: e.target.value }))}
                />
              </EditField>

              <EditField label="Email">
                <input
                  className="admin-edit-input"
                  type="email"
                  value={editState.email}
                  onChange={(e) => setEditState((p) => ({ ...p, email: e.target.value }))}
                />
              </EditField>

              <EditField label="Phone">
                <input
                  className="admin-edit-input"
                  value={editState.phone}
                  onChange={(e) => setEditState((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="Optional"
                />
              </EditField>

              <EditField label="Brand / Organisation">
                <input
                  className="admin-edit-input"
                  value={editState.business_name}
                  onChange={(e) => setEditState((p) => ({ ...p, business_name: e.target.value }))}
                  placeholder="Optional"
                />
              </EditField>

              <EditField label="Location">
                <input
                  className="admin-edit-input"
                  value={editState.location}
                  onChange={(e) => setEditState((p) => ({ ...p, location: e.target.value }))}
                />
              </EditField>

              <EditField label="Instagram / Website">
                <input
                  className="admin-edit-input"
                  value={editState.instagram_website}
                  onChange={(e) => setEditState((p) => ({ ...p, instagram_website: e.target.value }))}
                  placeholder="Optional"
                />
              </EditField>

              <EditField label="Services">
                <div className="flex flex-wrap gap-2 mt-1">
                  {ALL_SERVICES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleService(s)}
                      className={`text-xs tracking-[2px] uppercase font-ui font-semibold border px-2 py-1 transition-colors ${
                        editState.services.includes(s)
                          ? 'border-white text-white bg-white text-black'
                          : 'border-[#555] text-[#555]'
                      }`}
                    >
                      {SERVICE_LABELS[s]}
                    </button>
                  ))}
                </div>
                {editState.services.includes('other') && (
                  <input
                    className="admin-edit-input mt-3"
                    value={editState.services_other}
                    onChange={(e) => setEditState((p) => ({ ...p, services_other: e.target.value }))}
                    placeholder="Describe other service"
                  />
                )}
              </EditField>

              <EditField label="About">
                <textarea
                  className="admin-edit-input resize-none"
                  rows={6}
                  value={editState.about_me}
                  onChange={(e) => setEditState((p) => ({ ...p, about_me: e.target.value }))}
                />
              </EditField>

              <EditField label="Headshot URL">
                <input
                  className="admin-edit-input"
                  value={editState.headshot_url}
                  onChange={(e) => setEditState((p) => ({ ...p, headshot_url: e.target.value }))}
                />
              </EditField>

              <EditField label="Portfolio URL">
                <input
                  className="admin-edit-input"
                  value={editState.portfolio_url}
                  onChange={(e) => setEditState((p) => ({ ...p, portfolio_url: e.target.value }))}
                  placeholder="Optional"
                />
              </EditField>

              <EditField label="Supplementary Material URL">
                <input
                  className="admin-edit-input"
                  value={editState.supplementary_url}
                  onChange={(e) => setEditState((p) => ({ ...p, supplementary_url: e.target.value }))}
                  placeholder="Optional"
                />
              </EditField>
            </>
          ) : (
            <>
              <Field label="Email">
                <a href={`mailto:${app.email}`} className="text-white hover:text-white transition-colors text-sm">
                  {app.email}
                </a>
              </Field>

              {app.phone && <Field label="Phone"><span className="text-white text-sm">{app.phone}</span></Field>}

              {app.business_name && (
                <Field label="Brand / Organisation"><span className="text-white text-sm">{app.business_name}</span></Field>
              )}

              <Field label="Location"><span className="text-white text-sm">{app.location}</span></Field>

              {app.instagram_website && (
                <Field label="Instagram / Website"><span className="text-white text-sm">{app.instagram_website}</span></Field>
              )}

              <Field label="Services">
                <div className="flex flex-wrap gap-2 mt-1">
                  {(app.services ?? []).map((s) => (
                    <span
                      key={s}
                      className="text-xs tracking-[2px] uppercase font-ui font-semibold border border-white px-2 py-1 text-white"
                    >
                      {SERVICE_LABELS[s] ?? s}
                    </span>
                  ))}
                </div>
                {app.services_other && (
                  <p className="text-white text-sm mt-2">{app.services_other}</p>
                )}
              </Field>

              <Field label="About">
                <p className="text-white text-sm leading-relaxed font-light">{app.about_me}</p>
              </Field>

              <Field label="Headshot">
                <a
                  href={app.headshot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-sm hover:text-white transition-colors break-all"
                >
                  View headshot ↗
                </a>
              </Field>

              {app.portfolio_url && (
                <Field label="Portfolio">
                  <a
                    href={app.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-sm hover:text-white transition-colors break-all"
                  >
                    {app.portfolio_url}
                  </a>
                </Field>
              )}

              {app.supplementary_url && (
                <Field label="Supplementary Material">
                  <a
                    href={app.supplementary_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-sm hover:text-white transition-colors break-all"
                  >
                    View file ↗
                  </a>
                </Field>
              )}

              <Field label="Submitted">
                <span className="text-white text-sm">
                  {new Date(app.created_at).toLocaleDateString('en-IE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </Field>

              {app.deleted_at && (
                <Field label="Deleted">
                  <span className="text-[#CC0000] text-sm">
                    {new Date(app.deleted_at).toLocaleDateString('en-IE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white mb-2">
        {label}
      </p>
      {children}
    </div>
  )
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#999] mb-2">
        {label}
      </p>
      {children}
    </div>
  )
}
