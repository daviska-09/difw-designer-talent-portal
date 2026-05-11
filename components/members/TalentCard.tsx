import type { TalentApplication } from '@/lib/types'

const SERVICE_LABELS: Record<string, string> = {
  photographer: 'Photographer',
  videographer: 'Videographer',
  model: 'Model',
  stylist: 'Stylist',
  mua: 'MUA',
  other: 'Other',
}

interface TalentCardProps {
  talent: TalentApplication
  onClick: () => void
}

export function TalentCard({ talent, onClick }: TalentCardProps) {
  const name = [talent.first_name, talent.last_name].filter(Boolean).join(' ')
  const bio = talent.about_me?.slice(0, 120) + (talent.about_me?.length > 120 ? '...' : '')

  return (
    <button
      onClick={onClick}
      className="text-left w-full border border-[#1a1a1a] p-6 hover:border-[#555] transition-colors group"
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {(talent.services ?? []).map((s) => (
          <span
            key={s}
            className="text-xs tracking-[2px] uppercase font-ui font-semibold border border-[#555] px-2 py-1 text-white"
          >
            {SERVICE_LABELS[s] ?? s}
          </span>
        ))}
      </div>

      <p className="font-display text-xl tracking-[2px] uppercase mb-1 group-hover:text-white transition-colors text-white">
        {name}
      </p>

      {talent.business_name && (
        <p className="text-xs text-white font-ui tracking-[1px] uppercase mb-3">
          {talent.business_name}
        </p>
      )}

      <p className="text-sm text-white leading-relaxed font-body font-light">{bio}</p>

      {talent.portfolio_url && (
        <p className="mt-4 text-xs tracking-[2px] uppercase font-ui font-semibold text-[#444] group-hover:text-white transition-colors">
          View Portfolio →
        </p>
      )}
    </button>
  )
}
