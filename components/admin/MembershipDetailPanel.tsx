'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { MembershipApplication } from '@/lib/types'

interface Props {
  application: MembershipApplication
  onClose: () => void
  onStatusChange: (id: string, status: 'approved' | 'rejected' | 'paid') => void
}

export function MembershipDetailPanel({ application: app, onClose, onStatusChange }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAction(status: 'approved' | 'rejected') {
    setLoading(status)
    setError(null)
    try {
      const res = await fetch(`/api/membership/${app.id}/status`, {
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

  async function handleActivate() {
    if (!confirm('This will create a member account and send login credentials. Continue?')) return
    setLoading('activate')
    setError(null)
    try {
      const res = await fetch(`/api/membership/${app.id}/activate`, { method: 'POST' })
      if (!res.ok) throw new Error('Activation failed')
      onStatusChange(app.id, 'paid')
    } catch {
      setError('Failed to activate account. Try again.')
    } finally {
      setLoading(null)
    }
  }

  const name = [app.first_name, app.last_name].filter(Boolean).join(' ')

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60" onClick={onClose} />

      <div className="w-full max-w-lg bg-black border-l border-[#1a1a1a] overflow-y-auto">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#1a1a1a] sticky top-0 bg-black z-10">
          <div>
            <p className="font-display text-xl tracking-[2px] uppercase">{name}</p>
            <div className="mt-1 flex items-center gap-3">
              <StatusBadge status={app.status as 'pending' | 'approved' | 'rejected' | 'paid'} />
              <span className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white">
                {app.membership_tier}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-white text-2xl leading-none transition-colors">
            ×
          </button>
        </div>

        {/* Actions */}
        <div className="px-8 py-6 border-b border-[#1a1a1a] flex flex-wrap gap-4">
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
          {app.status === 'approved' && (
            <Button
              onClick={handleActivate}
              loading={loading === 'activate'}
              disabled={!!loading}
            >
              Mark as Paid & Activate Account
            </Button>
          )}
          {app.status === 'paid' && (
            <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-emerald-500">
              Account Active
            </p>
          )}
        </div>

        {error && (
          <div className="px-8 py-4 border-b border-[#1a1a1a]">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="px-8 py-8 space-y-8">
          <Field label="Brand">{app.brand_name}</Field>
          <Field label="Email">
            <a href={`mailto:${app.email}`} className="text-white hover:text-white transition-colors text-sm">
              {app.email}
            </a>
          </Field>
          {app.phone && <Field label="Phone">{app.phone}</Field>}
          {app.website_url && (
            <Field label="Website">
              <a href={app.website_url} target="_blank" rel="noopener noreferrer" className="text-white text-sm hover:text-white transition-colors break-all">
                {app.website_url}
              </a>
            </Field>
          )}
          {app.instagram && <Field label="Instagram">{app.instagram}</Field>}
          <Field label="Membership Tier">
            <span className="text-xs tracking-[2px] uppercase font-ui font-semibold border border-white px-3 py-1 text-white">
              {app.membership_tier}
            </span>
          </Field>
          <Field label="About Their Work">
            <p className="text-white text-sm leading-relaxed font-light">{app.about_work}</p>
          </Field>
          <Field label="Why Join DIFW">
            <p className="text-white text-sm leading-relaxed font-light">{app.why_join}</p>
          </Field>
          <Field label="Submitted">
            <span className="text-white text-sm">
              {new Date(app.created_at).toLocaleDateString('en-IE', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </Field>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white mb-2">{label}</p>
      {typeof children === 'string' ? (
        <p className="text-white text-sm">{children}</p>
      ) : (
        children
      )}
    </div>
  )
}
