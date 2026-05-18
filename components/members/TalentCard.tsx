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
  return (
    <button
      onClick={onClick}
      className="text-left w-full bg-white p-4 group hover:opacity-90 transition-opacity"
    >
      {/* Headshot with black border frame */}
      <div className="border-2 border-black aspect-[4/5] overflow-hidden mb-4 w-full">
        <img
          src={talent.headshot_url}
          alt={talent.full_name}
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Full name */}
      <p className="font-display text-2xl tracking-[2px] uppercase text-black leading-tight mb-2">
        {talent.full_name}
      </p>

      {/* Service tags — solid black pill(s) */}
      <div className="flex flex-wrap gap-1">
        {(talent.services ?? []).map((s) => (
          <span
            key={s}
            className="bg-black text-white text-xs tracking-[2px] uppercase font-ui font-semibold px-2 py-1"
          >
            {SERVICE_LABELS[s] ?? s}
          </span>
        ))}
      </div>
    </button>
  )
}
