'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { MembershipApplication, MembershipStatus, MembershipTier, DIFW26Participation } from '@/lib/types'

const TIER_OPTIONS: MembershipTier[] = ['emerging_designer', 'established_designer', 'signature_designer', 'producer']

const TIER_LABELS: Record<MembershipTier, string> = {
  emerging_designer: 'Emerging',
  established_designer: 'Established',
  signature_designer: 'Signature',
  producer: 'Producer',
}

// ── Approve Modal ─────────────────────────────────────────────

function ApproveModal({
  app,
  onClose,
  onSuccess,
}: {
  app: MembershipApplication
  onClose: () => void
  onSuccess: () => void
}) {
  const [paymentLink, setPaymentLink] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/membership/${app.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_link: paymentLink, payment_amount: paymentAmount }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Failed')
      }
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-md bg-black border border-[#1a1a1a] p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="font-display text-xl tracking-[2px] uppercase">Approve Application</p>
            <p className="text-white text-sm mt-1">{app.full_name}</p>
          </div>
          <button onClick={onClose} className="text-white text-2xl leading-none">×</button>
        </div>

        <p className="text-white text-sm mb-8 leading-relaxed">
          Enter the payment details. An approval email with a payment button will be sent to the applicant immediately.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Payment Link *"
            type="url"
            value={paymentLink}
            onChange={(e) => setPaymentLink(e.target.value)}
            required
            placeholder="https://revolut.me/..."
          />
          <Input
            label="Payment Amount *"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            required
            placeholder="€150"
          />
          {error && (
            <p className="text-[#CC0000] text-sm border border-[#CC0000]/30 px-4 py-3">{error}</p>
          )}
          <div className="flex gap-4 pt-2">
            <Button type="submit" loading={loading}>
              Send Approval Email
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Detail Panel ──────────────────────────────────────────────

interface EditState {
  full_name: string
  brand_name: string
  location: string
  email: string
  phone: string
  instagram: string
  website_url: string
  membership_tier: MembershipTier
  difw26_participation: DIFW26Participation
  about_work: string
  why_join: string
  headshot_url: string
  logo_url: string
  emerging_proof_url: string
  supporting_docs_url: string
}

function toEditState(app: MembershipApplication): EditState {
  return {
    full_name: app.full_name,
    brand_name: app.brand_name,
    location: app.location,
    email: app.email,
    phone: app.phone,
    instagram: app.instagram ?? '',
    website_url: app.website_url ?? '',
    membership_tier: app.membership_tier as MembershipTier,
    difw26_participation: app.difw26_participation as DIFW26Participation,
    about_work: app.about_work,
    why_join: app.why_join,
    headshot_url: app.headshot_url ?? '',
    logo_url: app.logo_url,
    emerging_proof_url: app.emerging_proof_url ?? '',
    supporting_docs_url: app.supporting_docs_url ?? '',
  }
}

function DetailPanel({
  app,
  onClose,
  onStatusChange,
  onDelete,
  onRecover,
  onUpdate,
}: {
  app: MembershipApplication
  onClose: () => void
  onStatusChange: (id: string, status: MembershipStatus) => void
  onDelete: (id: string) => void
  onRecover: (id: string) => void
  onUpdate: (updated: MembershipApplication) => void
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editState, setEditState] = useState<EditState>(() => toEditState(app))

  const isDeleted = !!app.deleted_at

  async function handleReject() {
    setLoading('reject')
    setError(null)
    try {
      const res = await fetch(`/api/membership/${app.id}/reject`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      onStatusChange(app.id, 'rejected')
    } catch {
      setError('Failed to update. Try again.')
    } finally {
      setLoading(null)
    }
  }

  async function handleActivate() {
    setLoading('activate')
    setError(null)
    try {
      const res = await fetch(`/api/membership/${app.id}/activate`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      if (json.emailSent === false) {
        setError(`Account activated but welcome email failed: ${json.emailError ?? 'unknown error'}`)
      }
      onStatusChange(app.id, 'paid')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to activate. Try again.')
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete() {
    setLoading('delete')
    setConfirmingDelete(false)
    setError(null)
    try {
      const res = await fetch(`/api/membership/${app.id}/delete`, { method: 'POST' })
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
      const res = await fetch(`/api/membership/${app.id}/recover`, { method: 'POST' })
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
        brand_name: editState.brand_name.trim(),
        location: editState.location.trim(),
        email: editState.email.trim(),
        phone: editState.phone.trim(),
        instagram: editState.instagram.trim() || null,
        website_url: editState.website_url.trim() || null,
        membership_tier: editState.membership_tier,
        difw26_participation: editState.difw26_participation,
        about_work: editState.about_work.trim(),
        why_join: editState.why_join.trim(),
        headshot_url: editState.headshot_url.trim() || null,
        logo_url: editState.logo_url.trim(),
        emerging_proof_url: editState.emerging_proof_url.trim() || null,
        supporting_docs_url: editState.supporting_docs_url.trim() || null,
      }
      const res = await fetch(`/api/membership/${app.id}/update`, {
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

  return (
    <>
      <div className="fixed inset-0 z-50 flex">
        {!fullscreen && <div className="flex-1 bg-black/60" onClick={editing ? undefined : onClose} />}

        <div className={`bg-black border-l border-[#1a1a1a] overflow-y-auto flex flex-col transition-all ${fullscreen ? 'w-full' : 'w-full max-w-lg'}`}>

          {/* Header */}
          <div className="flex items-start justify-between px-8 py-6 border-b border-[#1a1a1a] sticky top-0 bg-black z-10">
            <div>
              <p className="font-display text-xl tracking-[2px] uppercase">
                {editing ? editState.full_name : app.full_name}
              </p>
              <div className="mt-2 flex items-center gap-3">
                {isDeleted ? (
                  <span className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#CC0000]">Deleted</span>
                ) : (
                  <StatusBadge status={app.status as MembershipStatus} />
                )}
                <span className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white">
                  {TIER_LABELS[editing ? editState.membership_tier : app.membership_tier as MembershipTier] ?? app.membership_tier}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-1">
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
          <div className="px-8 py-6 border-b border-[#1a1a1a] flex flex-wrap gap-3">
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
                    <Button onClick={() => setShowApproveModal(true)} disabled={!!loading}>
                      Approve
                    </Button>
                    <Button variant="outline" onClick={handleReject} loading={loading === 'reject'} disabled={!!loading}>
                      Reject
                    </Button>
                  </>
                )}
                {app.status === 'approved' && (
                  <Button onClick={handleActivate} loading={loading === 'activate'} disabled={!!loading}>
                    Mark as Paid &amp; Activate
                  </Button>
                )}
                {app.status === 'paid' && (
                  <div className="w-full flex flex-col gap-3">
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-emerald-500">Account Active</p>
                      {confirmingDelete ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white">Delete?</span>
                          <button onClick={handleDelete} disabled={!!loading} className="text-xs tracking-[2px] uppercase font-ui font-semibold px-3 py-1 bg-[#CC0000] text-white disabled:opacity-40">
                            Confirm
                          </button>
                          <button onClick={() => setConfirmingDelete(false)} disabled={!!loading} className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white hover:text-white transition-colors">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmingDelete(true)} disabled={!!loading} className="text-xs tracking-[2px] uppercase font-ui font-semibold px-3 py-1 bg-[#CC0000] text-white disabled:opacity-40">
                          Delete
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleActivate} loading={loading === 'activate'} disabled={!!loading} className="self-start text-xs px-4 py-2">
                        Resend Welcome Email
                      </Button>
                      <Button variant="outline" onClick={() => setEditing(true)} disabled={!!loading}>
                        Edit
                      </Button>
                    </div>
                  </div>
                )}
                {app.status === 'rejected' && (
                  <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white">Rejected</p>
                )}
                {app.status !== 'paid' && (
                  <>
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
              </>
            )}
          </div>

          {error && (
            <div className="px-8 py-4 border-b border-[#1a1a1a]">
              <p className="text-[#CC0000] text-sm">{error}</p>
            </div>
          )}

          {/* Fields */}
          <div className="px-8 py-8 space-y-7">
            {editing ? (
              <>
                <EditField label="Full Name">
                  <input className="admin-edit-input" value={editState.full_name} onChange={(e) => setEditState((p) => ({ ...p, full_name: e.target.value }))} />
                </EditField>
                <EditField label="Brand Name">
                  <input className="admin-edit-input" value={editState.brand_name} onChange={(e) => setEditState((p) => ({ ...p, brand_name: e.target.value }))} />
                </EditField>
                <EditField label="Location">
                  <input className="admin-edit-input" value={editState.location} onChange={(e) => setEditState((p) => ({ ...p, location: e.target.value }))} />
                </EditField>
                <EditField label="Email">
                  <input className="admin-edit-input" type="email" value={editState.email} onChange={(e) => setEditState((p) => ({ ...p, email: e.target.value }))} />
                </EditField>
                <EditField label="Phone">
                  <input className="admin-edit-input" value={editState.phone} onChange={(e) => setEditState((p) => ({ ...p, phone: e.target.value }))} />
                </EditField>
                <EditField label="Instagram">
                  <input className="admin-edit-input" value={editState.instagram} onChange={(e) => setEditState((p) => ({ ...p, instagram: e.target.value }))} placeholder="Optional" />
                </EditField>
                <EditField label="Website">
                  <input className="admin-edit-input" value={editState.website_url} onChange={(e) => setEditState((p) => ({ ...p, website_url: e.target.value }))} placeholder="Optional" />
                </EditField>
                <EditField label="Membership Tier">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {TIER_OPTIONS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setEditState((p) => ({ ...p, membership_tier: t }))}
                        className={`text-xs tracking-[2px] uppercase font-ui font-semibold border px-2 py-1 transition-colors ${
                          editState.membership_tier === t ? 'border-white bg-white text-black' : 'border-[#555] text-[#555]'
                        }`}
                      >
                        {TIER_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </EditField>
                <EditField label="DIFW26 Participation">
                  <div className="flex gap-2 mt-1">
                    {(['yes', 'no', 'unsure'] as DIFW26Participation[]).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setEditState((p) => ({ ...p, difw26_participation: v }))}
                        className={`text-xs tracking-[2px] uppercase font-ui font-semibold border px-2 py-1 transition-colors capitalize ${
                          editState.difw26_participation === v ? 'border-white bg-white text-black' : 'border-[#555] text-[#555]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </EditField>
                <EditField label="About Their Work">
                  <textarea className="admin-edit-input resize-none" rows={5} value={editState.about_work} onChange={(e) => setEditState((p) => ({ ...p, about_work: e.target.value }))} />
                </EditField>
                <EditField label="Why Join DIFW">
                  <textarea className="admin-edit-input resize-none" rows={5} value={editState.why_join} onChange={(e) => setEditState((p) => ({ ...p, why_join: e.target.value }))} />
                </EditField>
                <EditField label="Headshot URL">
                  <input className="admin-edit-input" value={editState.headshot_url} onChange={(e) => setEditState((p) => ({ ...p, headshot_url: e.target.value }))} placeholder="Optional" />
                </EditField>
                <EditField label="Logo URL">
                  <input className="admin-edit-input" value={editState.logo_url} onChange={(e) => setEditState((p) => ({ ...p, logo_url: e.target.value }))} />
                </EditField>
                <EditField label="Eligibility Proof URL">
                  <input className="admin-edit-input" value={editState.emerging_proof_url} onChange={(e) => setEditState((p) => ({ ...p, emerging_proof_url: e.target.value }))} placeholder="Optional" />
                </EditField>
                <EditField label="Supporting Docs URL">
                  <input className="admin-edit-input" value={editState.supporting_docs_url} onChange={(e) => setEditState((p) => ({ ...p, supporting_docs_url: e.target.value }))} placeholder="Optional" />
                </EditField>
              </>
            ) : (
              <>
                <Field label="Brand">{app.brand_name}</Field>
                <Field label="Location">{app.location}</Field>
                <Field label="Email">
                  <a href={`mailto:${app.email}`} className="text-white text-sm hover:text-white transition-colors">{app.email}</a>
                </Field>
                <Field label="Phone">{app.phone}</Field>
                {app.instagram && <Field label="Instagram">{app.instagram}</Field>}
                {app.website_url && (
                  <Field label="Website">
                    <a href={app.website_url} target="_blank" rel="noopener noreferrer" className="text-white text-sm hover:text-white transition-colors break-all">{app.website_url}</a>
                  </Field>
                )}
                <Field label="DIFW26">
                  <span className="capitalize text-white text-sm">{app.difw26_participation}</span>
                </Field>
                <Field label="About Their Work">
                  <p className="text-white text-sm leading-relaxed font-light">{app.about_work}</p>
                </Field>
                <Field label="Why Join DIFW">
                  <p className="text-white text-sm leading-relaxed font-light">{app.why_join}</p>
                </Field>
                <Field label="Uploads">
                  <div className="flex flex-wrap gap-4 mt-1">
                    {app.headshot_url && <a href={app.headshot_url} target="_blank" rel="noopener noreferrer" className="text-xs tracking-[1px] uppercase font-ui text-white border border-white px-3 py-1.5 hover:border-white transition-colors">Headshot</a>}
                    <a href={app.logo_url} target="_blank" rel="noopener noreferrer" className="text-xs tracking-[1px] uppercase font-ui text-white border border-white px-3 py-1.5 hover:border-white transition-colors">Logo</a>
                    {app.emerging_proof_url && (
                      <a href={app.emerging_proof_url} target="_blank" rel="noopener noreferrer" className="text-xs tracking-[1px] uppercase font-ui text-white border border-white px-3 py-1.5 hover:border-white transition-colors">Eligibility Proof</a>
                    )}
                    {app.supporting_docs_url && (
                      <a href={app.supporting_docs_url} target="_blank" rel="noopener noreferrer" className="text-xs tracking-[1px] uppercase font-ui text-white border border-white px-3 py-1.5 hover:border-white transition-colors">Supporting Docs</a>
                    )}
                  </div>
                </Field>
                <Field label="Submitted">
                  <span className="text-white text-sm">
                    {new Date(app.created_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </Field>
                {app.deleted_at && (
                  <Field label="Deleted">
                    <span className="text-[#CC0000] text-sm">
                      {new Date(app.deleted_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </Field>
                )}
              </>
            )}
          </div>

        </div>
      </div>

      {showApproveModal && (
        <ApproveModal
          app={app}
          onClose={() => setShowApproveModal(false)}
          onSuccess={() => {
            setShowApproveModal(false)
            onStatusChange(app.id, 'approved')
          }}
        />
      )}
    </>
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

// ── Main Client ───────────────────────────────────────────────

type FilterStatus = MembershipStatus | 'all' | 'deleted'

export function AdminMembershipClient({ initialApplications }: { initialApplications: MembershipApplication[] }) {
  const [applications, setApplications] = useState(initialApplications)
  const [selectedApp, setSelectedApp] = useState<MembershipApplication | null>(null)
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [tierFilter, setTierFilter] = useState<MembershipTier | 'all'>('all')
  const [search, setSearch] = useState('')

  function handleStatusChange(id: string, status: MembershipStatus) {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    if (selectedApp?.id === id) setSelectedApp((prev) => (prev ? { ...prev, status } : null))
  }

  function handleDelete(id: string) {
    const now = new Date().toISOString()
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, deleted_at: now } : a)))
    setSelectedApp(null)
  }

  function handleRecover(id: string) {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, deleted_at: null } : a)))
    setSelectedApp(null)
  }

  function handleUpdate(updated: MembershipApplication) {
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
    setSelectedApp(updated)
  }

  const active = useMemo(() => applications.filter((a) => !a.deleted_at), [applications])
  const deleted = useMemo(() => applications.filter((a) => !!a.deleted_at), [applications])

  const filtered = useMemo(() => {
    let result = statusFilter === 'deleted' ? deleted : active
    if (statusFilter !== 'all' && statusFilter !== 'deleted') result = result.filter((a) => a.status === statusFilter)
    if (tierFilter !== 'all') result = result.filter((a) => a.membership_tier === tierFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((a) =>
        [
          a.full_name, a.brand_name, a.email, a.location, a.phone,
          a.instagram, a.website_url, a.about_work, a.why_join,
          a.membership_tier, a.difw26_participation,
        ]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(q))
      )
    }
    return result
  }, [active, deleted, statusFilter, tierFilter, search])

  const counts = useMemo(() => ({
    all: active.length,
    pending: active.filter((a) => a.status === 'pending').length,
    approved: active.filter((a) => a.status === 'approved').length,
    rejected: active.filter((a) => a.status === 'rejected').length,
    paid: active.filter((a) => a.status === 'paid').length,
    deleted: deleted.length,
  }), [active, deleted])

  return (
    <div className="px-8 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="font-display text-4xl tracking-[3px] uppercase">Membership Applications</h1>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          {([
            { label: 'All', value: 'all', count: counts.all },
            { label: 'Needs Review', value: 'pending', count: counts.pending },
            { label: 'Approved', value: 'approved', count: counts.approved },
            { label: 'Active', value: 'paid', count: counts.paid },
            { label: 'Rejected', value: 'rejected', count: counts.rejected },
            { label: 'Archived', value: 'deleted', count: counts.deleted },
          ] as const).map(({ label, value, count }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`text-xs tracking-[2px] uppercase font-ui font-semibold px-4 py-2 border transition-colors ${
                statusFilter === value
                  ? value === 'deleted' ? 'border-[#CC0000] text-[#CC0000]' : 'border-white text-white'
                  : 'border-white text-white hover:border-white hover:text-white'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Tier filter */}
        <div className="flex items-center mb-6">
          {(['all', ...TIER_OPTIONS] as const).map((t, i) => (
            <span key={t} className="flex items-center">
              {i > 0 && <span className="text-white mx-2">·</span>}
              <button
                onClick={() => setTierFilter(t)}
                className={`font-ui text-[11px] tracking-[2px] uppercase transition-colors ${
                  tierFilter === t ? 'text-white underline' : 'text-white no-underline hover:text-white'
                }`}
              >
                {t === 'all' ? 'All Tiers' : TIER_LABELS[t as MembershipTier]}
              </button>
            </span>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-8 pb-8 border-b border-[#1a1a1a]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applications..."
            className="w-full bg-transparent border-b border-[#333] text-white font-body text-sm py-2 pr-8 placeholder:text-white placeholder:tracking-[1px] placeholder:uppercase focus:outline-none focus:border-white transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white hover:text-white transition-colors text-lg leading-none pb-1"
            >
              ×
            </button>
          )}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <p className="text-white text-sm py-16 text-center">No applications match your filters.</p>
        ) : (
          <div className="border border-[#1a1a1a]">
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-0 border-b border-[#1a1a1a] px-6 py-3">
              {['Name / Brand', 'Email', 'Tier', 'Submitted', 'Status'].map((h) => (
                <span key={h} className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white">{h}</span>
              ))}
            </div>
            {filtered.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className={`w-full grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-0 px-6 py-4 border-b border-[#0d0d0d] hover:bg-[#050505] transition-colors text-left ${app.deleted_at ? 'opacity-50' : ''}`}
              >
                <div>
                  <p className="text-white text-sm font-medium">{app.full_name}</p>
                  <p className="text-white text-xs mt-0.5">{app.brand_name}</p>
                </div>
                <p className="text-white text-xs truncate pr-4">{app.email}</p>
                <span className="text-xs tracking-[1px] uppercase font-ui text-white">
                  {TIER_LABELS[app.membership_tier as MembershipTier] ?? app.membership_tier}
                </span>
                <p className="text-white text-xs">
                  {new Date(app.created_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <div>
                  <StatusBadge status={app.status as MembershipStatus} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedApp && (
        <DetailPanel
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onRecover={handleRecover}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
