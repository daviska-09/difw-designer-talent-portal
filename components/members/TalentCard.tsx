import type { TalentApplication } from '@/lib/types'

const SERVICE_LABELS: Record<string, string> = {
  model: 'Model',
  photographer: 'Photographer',
  videographer: 'Videographer',
  content_creator: 'Content Creator',
  stylist: 'Stylist',
  hair_stylist: 'Hair Stylist',
  mua: 'MUA',
  production_crew: 'Production Crew',
  general_volunteer: 'General Volunteer',
  lighting_technician: 'Lighting Technician',
  sound_technician: 'Sound Technician',
  dj_musician: 'DJ / Musician',
  performer: 'Performer',
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
      className="text-left w-full bg-white p-2 group hover:opacity-90 transition-opacity"
    >
      {/* Headshot with black border frame */}
      <div className="border border-black aspect-[4/5] overflow-hidden mb-2 w-full">
        <img
          src={talent.headshot_url}
          alt={talent.full_name}
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Full name */}
      <p className="font-display text-sm tracking-[1px] uppercase text-black leading-tight mb-1">
        {talent.full_name}
      </p>

      {/* Service tags — solid black pill(s) */}
      <div className="flex flex-wrap gap-1">
        {(talent.services ?? []).map((s) => (
          <span
            key={s}
            className="bg-black text-white text-[10px] tracking-[1px] uppercase font-ui font-semibold px-1.5 py-0.5"
          >
            {SERVICE_LABELS[s] ?? s}
          </span>
        ))}
      </div>
    </button>
  )
}
