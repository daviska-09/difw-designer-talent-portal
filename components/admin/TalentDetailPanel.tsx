'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { TalentApplication } from '@/lib/types'

const SERVICE_LABELS: Record<string, string> = {
  photographer: 'Photographer',
  videographer: 'Videographer',
  model: 'Model',
  stylist: 'Stylist',
  mua: 'MUA',
  other: 'Other',
}

interface Props {
  application: TalentApplication
  onClose: () => void
  onStatusChange: (id: string, status: 'approved' | 'rejected') => void
}

export function TalentDetailPanel({ application: app, onClose, onStatusChange }: Props) {
  const [loading, setLoading] = useState<'approved' | 'rejected' | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const name = [app.first_name, app.last_name].filter(Boolean).join(' ')

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/60" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-lg bg-black border-l border-[#1a1a1a] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#1a1a1a] sticky top-0 bg-black z-10">
          <div>
            <p className="font-display text-xl tracking-[2px] uppercase">{name}</p>
            <div className="mt-1">
              <StatusBadge status={app.status as 'pending' | 'approved' | 'rejected'} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-white text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Actions */}
        {app.status === 'pending' && (
          <div className="px-8 py-6 border-b border-[#1a1a1a] flex gap-4">
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
          </div>
        )}

        {error && (
          <div className="px-8 py-4 border-b border-[#1a1a1a]">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Details */}
        <div className="px-8 py-8 space-y-8">
          <Field label="Email">
            <a href={`mailto:${app.email}`} className="text-white hover:text-white transition-colors text-sm">
              {app.email}
            </a>
          </Field>

          {app.phone && <Field label="Phone"><span className="text-white text-sm">{app.phone}</span></Field>}

          {app.business_name && (
            <Field label="Business Name"><span className="text-white text-sm">{app.business_name}</span></Field>
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
                {app.supplementary_url}
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
