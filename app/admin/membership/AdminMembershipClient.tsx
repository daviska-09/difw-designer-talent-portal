'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { MembershipApplication, MembershipStatus, MembershipTier } from '@/lib/types'

const STATUS_OPTIONS: MembershipStatus[] = ['pending', 'approved', 'rejected', 'paid']
const TIER_OPTIONS: MembershipTier[] = ['emerging_designer', 'established_designer', 'signature_designer', 'curator']

const TIER_LABELS: Record<MembershipTier, string> = {
  emerging_designer: 'Emerging',
  established_designer: 'Established',
  signature_designer: 'Signature',
  curator: 'Curator',
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
            <p className="text-[#888] text-sm mt-1">{app.full_name}</p>
          </div>
          <button onClick={onClose} className="text-white text-2xl leading-none">×</button>
        </div>

        <p className="text-[#888] text-sm mb-8 leading-relaxed">
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

function DetailPanel({
  app,
  onClose,
  onStatusChange,
}: {
  app: MembershipApplication
  onClose: () => void
  onStatusChange: (id: string, status: MembershipStatus) => void
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  async function handleReject() {
    if (!confirm('Mark this application as rejected? No email will be sent.')) return
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
    if (!confirm('This will create a member account and send the welcome email with portal access link. Continue?')) return
    setLoading('activate')
    setError(null)
    try {
      const res = await fetch(`/api/membership/${app.id}/activate`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      onStatusChange(app.id, 'paid')
    } catch {
      setError('Failed to activate. Try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop — hidden in fullscreen */}
        {!fullscreen && <div className="flex-1 bg-black/60" onClick={onClose} />}

        <div className={`bg-black border-l border-[#1a1a1a] overflow-y-auto flex flex-col transition-all ${fullscreen ? 'w-full' : 'w-full max-w-lg'}`}>

          {/* Header */}
          <div className="flex items-start justify-between px-8 py-6 border-b border-[#1a1a1a] sticky top-0 bg-black z-10">
            <div>
              <p className="font-display text-xl tracking-[2px] uppercase">{app.full_name}</p>
              <div className="mt-2 flex items-center gap-3">
                <StatusBadge status={app.status as MembershipStatus} />
                <span className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white">
                  {TIER_LABELS[app.membership_tier as MembershipTier] ?? app.membership_tier}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <button
                onClick={() => setFullscreen((f) => !f)}
                className="text-[#666] hover:text-white transition-colors text-2xl font-bold leading-none"
                title={fullscreen ? 'Collapse' : 'Expand'}
              >
                {fullscreen ? '⤡' : '⤢'}
              </button>
              <button onClick={onClose} className="text-white text-2xl leading-none">×</button>
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-6 border-b border-[#1a1a1a] flex flex-wrap gap-3">
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
              <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-emerald-500">Account Active</p>
            )}
            {app.status === 'rejected' && (
              <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#888]">Rejected</p>
            )}
          </div>

          {error && (
            <div className="px-8 py-4 border-b border-[#1a1a1a]">
              <p className="text-[#CC0000] text-sm">{error}</p>
            </div>
          )}

          {/* Fields */}
          <div className="px-8 py-8 space-y-7">
            <Field label="Brand">{app.brand_name}</Field>
            <Field label="Location">{app.location}</Field>
            <Field label="Email">
              <a href={`mailto:${app.email}`} className="text-white text-sm hover:text-[#ccc] transition-colors">{app.email}</a>
            </Field>
            <Field label="Phone">{app.phone}</Field>
            {app.instagram && <Field label="Instagram">{app.instagram}</Field>}
            {app.website_url && (
              <Field label="Website">
                <a href={app.website_url} target="_blank" rel="noopener noreferrer" className="text-white text-sm hover:text-[#ccc] transition-colors break-all">{app.website_url}</a>
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
                <a href={app.headshot_url} target="_blank" rel="noopener noreferrer" className="text-xs tracking-[1px] uppercase font-ui text-white border border-[#333] px-3 py-1.5 hover:border-white transition-colors">Headshot</a>
                <a href={app.logo_url} target="_blank" rel="noopener noreferrer" className="text-xs tracking-[1px] uppercase font-ui text-white border border-[#333] px-3 py-1.5 hover:border-white transition-colors">Logo</a>
                {app.emerging_proof_url && (
                  <a href={app.emerging_proof_url} target="_blank" rel="noopener noreferrer" className="text-xs tracking-[1px] uppercase font-ui text-white border border-[#333] px-3 py-1.5 hover:border-white transition-colors">Eligibility Proof</a>
                )}
                {app.supporting_docs_url && (
                  <a href={app.supporting_docs_url} target="_blank" rel="noopener noreferrer" className="text-xs tracking-[1px] uppercase font-ui text-white border border-[#333] px-3 py-1.5 hover:border-white transition-colors">Supporting Docs</a>
                )}
              </div>
            </Field>
            <Field label="Submitted">
              <span className="text-white text-sm">
                {new Date(app.created_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </Field>
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

// ── Main Client ───────────────────────────────────────────────

export function AdminMembershipClient({ initialApplications }: { initialApplications: MembershipApplication[] }) {
  const [applications, setApplications] = useState(initialApplications)
  const [selectedApp, setSelectedApp] = useState<MembershipApplication | null>(null)
  const [statusFilter, setStatusFilter] = useState<MembershipStatus | 'all'>('all')
  const [tierFilter, setTierFilter] = useState<MembershipTier | 'all'>('all')

  function handleStatusChange(id: string, status: MembershipStatus) {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    if (selectedApp?.id === id) setSelectedApp((prev) => (prev ? { ...prev, status } : null))
  }

  const filtered = useMemo(() => {
    let result = applications
    if (statusFilter !== 'all') result = result.filter((a) => a.status === statusFilter)
    if (tierFilter !== 'all') result = result.filter((a) => a.membership_tier === tierFilter)
    return result
  }, [applications, statusFilter, tierFilter])

  const counts = useMemo(() => ({
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
    paid: applications.filter((a) => a.status === 'paid').length,
  }), [applications])

  return (
    <div className="px-8 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="font-display text-4xl tracking-[3px] uppercase mb-2">Membership Applications</h1>
          <p className="text-white text-sm">{applications.length} total submissions</p>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          {(['all', ...STATUS_OPTIONS] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs tracking-[2px] uppercase font-ui font-semibold px-4 py-2 border transition-colors ${
                statusFilter === s ? 'border-white text-white' : 'border-[#444] text-[#888] hover:border-[#888] hover:text-white'
              }`}
            >
              {s} ({s === 'all' ? counts.all : counts[s as MembershipStatus]})
            </button>
          ))}
        </div>

        {/* Tier filter */}
        <div className="flex flex-wrap gap-3 mb-8 pb-8 border-b border-[#1a1a1a]">
          {(['all', ...TIER_OPTIONS] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`text-xs tracking-[2px] uppercase font-ui font-semibold px-4 py-2 border transition-colors ${
                tierFilter === t ? 'border-white text-white' : 'border-[#444] text-[#888] hover:border-[#888] hover:text-white'
              }`}
            >
              {t === 'all' ? 'All Tiers' : TIER_LABELS[t as MembershipTier]}
            </button>
          ))}
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
                className="w-full grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-0 px-6 py-4 border-b border-[#0d0d0d] hover:bg-[#050505] transition-colors text-left"
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
        />
      )}
    </div>
  )
}
