'use client'

import { useState, useMemo } from 'react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Chip } from '@/components/ui/Chip'
import { TalentDetailPanel } from '@/components/admin/TalentDetailPanel'
import type { TalentApplication, TalentStatus, ServiceType } from '@/lib/types'

const SERVICE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: 'photographer', label: 'Photographer' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'model', label: 'Model' },
  { value: 'stylist', label: 'Stylist' },
  { value: 'mua', label: 'MUA' },
  { value: 'other', label: 'Other' },
]

const STATUS_OPTIONS: TalentStatus[] = ['pending', 'approved', 'rejected']

const SERVICE_LABELS: Record<string, string> = {
  photographer: 'Photographer',
  videographer: 'Videographer',
  model: 'Model',
  stylist: 'Stylist',
  mua: 'MUA',
  other: 'Other',
}

export function AdminTalentClient({
  initialApplications,
}: {
  initialApplications: TalentApplication[]
}) {
  const [applications, setApplications] = useState(initialApplications)
  const [selectedApp, setSelectedApp] = useState<TalentApplication | null>(null)
  const [statusFilter, setStatusFilter] = useState<TalentStatus | 'all'>('all')
  const [serviceFilter, setServiceFilter] = useState<ServiceType[]>([])

  function toggleServiceFilter(s: ServiceType) {
    setServiceFilter((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  function handleStatusChange(id: string, status: 'approved' | 'rejected') {
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
    if (serviceFilter.length > 0) {
      result = result.filter((a) => serviceFilter.some((s) => a.services?.includes(s)))
    }
    return result
  }, [applications, statusFilter, serviceFilter])

  const counts = useMemo(() => ({
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }), [applications])

  return (
    <div className="px-8 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl tracking-[3px] uppercase mb-2">Talent Applications</h1>
          <p className="text-white text-sm">{applications.length} total submissions</p>
        </div>

        {/* Status filter */}
        <div className="flex gap-3 mb-6">
          {(['all', ...STATUS_OPTIONS] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs tracking-[2px] uppercase font-ui font-semibold px-4 py-2 border transition-colors ${
                statusFilter === s
                  ? 'border-white text-white'
                  : 'border-[#444] text-[#888] hover:border-[#888] hover:text-white'
              }`}
            >
              {s} {s !== 'all' ? `(${counts[s]})` : `(${counts.all})`}
            </button>
          ))}
        </div>

        {/* Service filter */}
        <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-[#1a1a1a]">
          {SERVICE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              active={serviceFilter.includes(opt.value)}
              onClick={() => toggleServiceFilter(opt.value)}
            />
          ))}
          {serviceFilter.length > 0 && (
            <button
              onClick={() => setServiceFilter([])}
              className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white hover:text-[#ccc] transition-colors px-2"
            >
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <p className="text-white text-sm py-16 text-center">No applications match your filters.</p>
        ) : (
          <div className="border border-[#1a1a1a]">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-0 border-b border-[#1a1a1a] px-6 py-3">
              {['Name', 'Services', 'Email', 'Submitted', 'Status'].map((h) => (
                <span key={h} className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white">
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
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
                  {app.business_name && (
                    <p className="text-white text-xs mt-0.5">{app.business_name}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 items-start">
                  {(app.services ?? []).slice(0, 3).map((s) => (
                    <span key={s} className="text-xs tracking-[1px] uppercase font-ui text-white border border-[#222] px-1.5 py-0.5">
                      {SERVICE_LABELS[s] ?? s}
                    </span>
                  ))}
                  {(app.services ?? []).length > 3 && (
                    <span className="text-xs text-white">+{(app.services ?? []).length - 3}</span>
                  )}
                </div>
                <p className="text-white text-xs truncate pr-4">{app.email}</p>
                <p className="text-white text-xs">
                  {new Date(app.created_at).toLocaleDateString('en-IE', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <div>
                  <StatusBadge status={app.status as 'pending' | 'approved' | 'rejected'} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedApp && (
        <TalentDetailPanel
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
