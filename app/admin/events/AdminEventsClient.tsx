'use client'

import { useState, useMemo } from 'react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EventDetailPanel } from '@/components/admin/EventDetailPanel'
import type { EventSubmission, EventSubmissionStatus } from '@/lib/types'

type FilterStatus = EventSubmissionStatus | 'all' | 'deleted'

export function AdminEventsClient({ initialSubmissions }: { initialSubmissions: EventSubmission[] }) {
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [selected, setSelected] = useState<EventSubmission | null>(null)
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')

  function handleStatusChange(id: string, status: EventSubmissionStatus) {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
    if (selected?.id === id) setSelected((prev) => (prev ? { ...prev, status } : null))
  }

  function handleDelete(id: string) {
    const now = new Date().toISOString()
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, deleted_at: now } : s)))
    setSelected(null)
  }

  function handleRecover(id: string) {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, deleted_at: null } : s)))
    setSelected(null)
  }

  function handleUpdate(updated: EventSubmission) {
    setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    setSelected(updated)
  }

  const active = useMemo(() => submissions.filter((s) => !s.deleted_at), [submissions])
  const deleted = useMemo(() => submissions.filter((s) => !!s.deleted_at), [submissions])

  const filtered = useMemo(() => {
    let result = statusFilter === 'deleted' ? deleted : active
    if (statusFilter !== 'all' && statusFilter !== 'deleted') result = result.filter((s) => s.status === statusFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((s) =>
        [s.lead_applicant_name, s.brand_name, s.email, s.event_title, s.event_type, s.work_category]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(q))
      )
    }
    return result
  }, [active, deleted, statusFilter, search])

  const counts = useMemo(() => ({
    all: active.length,
    pending: active.filter((s) => s.status === 'pending').length,
    accepted: active.filter((s) => s.status === 'accepted').length,
    deferred: active.filter((s) => s.status === 'deferred').length,
    rejected: active.filter((s) => s.status === 'rejected').length,
    deleted: deleted.length,
  }), [active, deleted])

  return (
    <div className="px-8 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="font-display text-4xl tracking-[3px] uppercase">Event Submissions</h1>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          {([
            { label: 'All', value: 'all', count: counts.all },
            { label: 'Needs Review', value: 'pending', count: counts.pending },
            { label: 'Accepted', value: 'accepted', count: counts.accepted },
            { label: 'Deferred', value: 'deferred', count: counts.deferred },
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

        {/* Search */}
        <div className="relative mb-8 pb-8 border-b border-[#1a1a1a]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search submissions..."
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
          <p className="text-white text-sm py-16 text-center">No submissions match your filters.</p>
        ) : (
          <div className="border border-[#1a1a1a]">
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-0 border-b border-[#1a1a1a] px-6 py-3">
              {['Applicant / Brand', 'Event Title', 'Type', 'Submitted', 'Status'].map((h) => (
                <span key={h} className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white">{h}</span>
              ))}
            </div>
            {filtered.map((sub) => {
              const isDeleted = !!sub.deleted_at
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelected(sub)}
                  className={`w-full grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-0 px-6 py-4 border-b border-[#0d0d0d] hover:bg-[#050505] transition-colors text-left ${isDeleted ? 'opacity-50' : ''}`}
                >
                  <div>
                    <p className="text-white text-sm font-medium">{sub.lead_applicant_name}</p>
                    <p className="text-white text-xs mt-0.5">{sub.brand_name}</p>
                  </div>
                  <p className="text-white text-sm truncate pr-4">{sub.event_title}</p>
                  <span className="text-xs tracking-[1px] uppercase font-ui text-white truncate pr-2">
                    {sub.event_type}
                  </span>
                  <p className="text-white text-xs">
                    {new Date(sub.created_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <div>
                    <StatusBadge status={sub.status} />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {selected && (
        <EventDetailPanel
          submission={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onRecover={handleRecover}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
