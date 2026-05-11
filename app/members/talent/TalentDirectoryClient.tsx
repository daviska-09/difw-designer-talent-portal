'use client'

import { useState, useMemo } from 'react'
import { Chip } from '@/components/ui/Chip'
import { TalentCard } from '@/components/members/TalentCard'
import { TalentProfileModal } from '@/components/members/TalentProfileModal'
import type { TalentApplication, ServiceType } from '@/lib/types'

const SERVICE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: 'photographer', label: 'Photographer' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'model', label: 'Model' },
  { value: 'stylist', label: 'Stylist' },
  { value: 'mua', label: 'MUA' },
  { value: 'other', label: 'Other' },
]

export function TalentDirectoryClient({
  initialTalent,
}: {
  initialTalent: TalentApplication[]
}) {
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<ServiceType[]>([])
  const [selected, setSelected] = useState<TalentApplication | null>(null)

  function toggleFilter(s: ServiceType) {
    setActiveFilters((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  const filtered = useMemo(() => {
    let result = initialTalent

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          `${t.first_name} ${t.last_name}`.toLowerCase().includes(q) ||
          t.business_name?.toLowerCase().includes(q) ||
          t.about_me?.toLowerCase().includes(q)
      )
    }

    if (activeFilters.length > 0) {
      result = result.filter((t) =>
        activeFilters.some((f) => t.services?.includes(f))
      )
    }

    return result
  }, [initialTalent, search, activeFilters])

  return (
    <div className="px-8 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs tracking-[3px] uppercase font-ui font-semibold text-white mb-3">
            Member Area
          </p>
          <h1 className="font-display text-4xl tracking-[3px] uppercase mb-2">
            Talent Directory
          </h1>
          <p className="text-white text-sm">
            {initialTalent.length} approved profile{initialTalent.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand, or keyword..."
            className="input-base text-base"
          />
        </div>

        {/* Service filters */}
        <div className="flex flex-wrap gap-3 mb-12 pb-8 border-b border-[#1a1a1a]">
          {SERVICE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              active={activeFilters.includes(opt.value)}
              onClick={() => toggleFilter(opt.value)}
            />
          ))}
          {activeFilters.length > 0 && (
            <button
              onClick={() => setActiveFilters([])}
              className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white hover:text-[#888] transition-colors px-2"
            >
              Clear
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="text-white text-sm py-20 text-center">
            No profiles match your search.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#111]">
            {filtered.map((talent) => (
              <div key={talent.id} className="bg-black">
                <TalentCard talent={talent} onClick={() => setSelected(talent)} />
              </div>
            ))}
          </div>
        )}
      </div>

      <TalentProfileModal talent={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
