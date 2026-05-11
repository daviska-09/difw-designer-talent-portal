'use client'

import { useState, useMemo } from 'react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { MembershipDetailPanel } from '@/components/admin/MembershipDetailPanel'
import type { MembershipApplication, MembershipStatus, MembershipTier } from '@/lib/types'

const STATUS_OPTIONS: MembershipStatus[] = ['pending', 'approved', 'rejected', 'paid']
const TIER_OPTIONS: MembershipTier[] = ['emerging', 'independent', 'studio']

export function AdminMembershipClient({
  initialApplications,
}: {
  initialApplications: MembershipApplication[]
}) {
  const [applications, setApplications] = useState(initialApplications)
  const [selectedApp, setSelectedApp] = useState<MembershipApplication | null>(null)
  const [statusFilter, setStatusFilter] = useState<MembershipStatus | 'all'>('all')
  const [tierFilter, setTierFilter] = useState<MembershipTier | 'all'>('all')

  function handleStatusChange(id: string, status: 'approved' | 'rejected' | 'paid') {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    )
    if (selectedApp?.id === id) {
      setSelectedApp((prev) => (prev ? { ...prev, status } : null))
    }
  }

  const filtered = useMemo(() => {
    let result = applications
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter)
    }
    if (tierFilter !== 'all') {
      result = result.filter((a) => a.membership_tier === tierFilter)
    }
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

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-[#1a1a1a]">
          {/* Status */}
          <div className="flex gap-2">
            {(['all', ...STATUS_OPTIONS] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs tracking-[2px] uppercase font-ui font-semibold px-3 py-2 border transition-colors ${
                  statusFilter === s
                    ? 'border-white text-white'
                    : 'border-[#444] text-[#888] hover:border-[#888] hover:text-white'
                }`}
              >
                {s} ({s === 'all' ? counts.all : counts[s as MembershipStatus]})
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-[#1a1a1a]" />

          {/* Tier */}
          <div className="flex gap-2">
            {(['all', ...TIER_OPTIONS] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`text-xs tracking-[2px] uppercase font-ui font-semibold px-3 py-2 border transition-colors ${
                  tierFilter === t
                    ? 'border-white text-white'
                    : 'border-[#444] text-[#888] hover:border-[#888] hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <p className="text-white text-sm py-16 text-center">No applications match your filters.</p>
        ) : (
          <div className="border border-[#1a1a1a]">
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-0 border-b border-[#1a1a1a] px-6 py-3">
              {['Name / Brand', 'Email', 'Tier', 'Submitted', 'Status'].map((h) => (
                <span key={h} className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white">
                  {h}
                </span>
              ))}
            </div>

            {filtered.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="w-full grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-0 px-6 py-4 border-b border-[#0d0d0d] hover:bg-[#050505] transition-colors text-left"
              >
                <div>
                  <p className="text-white text-sm font-medium">
                    {app.first_name} {app.last_name}
                  </p>
                  <p className="text-white text-xs mt-0.5">{app.brand_name}</p>
                </div>
                <p className="text-white text-xs truncate pr-4">{app.email}</p>
                <span className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white">
                  {app.membership_tier}
                </span>
                <p className="text-white text-xs">
                  {new Date(app.created_at).toLocaleDateString('en-IE', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <div>
                  <StatusBadge status={app.status as 'pending' | 'approved' | 'rejected' | 'paid'} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedApp && (
        <MembershipDetailPanel
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
