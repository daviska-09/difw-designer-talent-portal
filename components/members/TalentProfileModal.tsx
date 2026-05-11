import { Modal } from '@/components/ui/Modal'
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
  talent: TalentApplication | null
  onClose: () => void
}

export function TalentProfileModal({ talent, onClose }: Props) {
  if (!talent) return null
  const name = [talent.first_name, talent.last_name].filter(Boolean).join(' ')

  return (
    <Modal open={!!talent} onClose={onClose} title={name}>
      <div className="space-y-8">
        {talent.business_name && (
          <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white">
            {talent.business_name}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {(talent.services ?? []).map((s) => (
            <span
              key={s}
              className="text-xs tracking-[2px] uppercase font-ui font-semibold border border-white px-3 py-1 text-white"
            >
              {SERVICE_LABELS[s] ?? s}
            </span>
          ))}
          {talent.services_other && (
            <span className="text-xs tracking-[2px] uppercase font-ui font-semibold border border-[#555] px-3 py-1 text-white">
              {talent.services_other}
            </span>
          )}
        </div>

        <div>
          <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white mb-3">
            About
          </p>
          <p className="text-white leading-relaxed text-sm font-light">{talent.about_me}</p>
        </div>

        <div className="border-t border-[#1a1a1a] pt-6 space-y-4">
          <div>
            <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white mb-1">
              Email
            </p>
            <a
              href={`mailto:${talent.email}`}
              className="text-white text-sm hover:text-white transition-colors"
            >
              {talent.email}
            </a>
          </div>

          {talent.portfolio_url && (
            <div>
              <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white mb-1">
                Portfolio
              </p>
              <a
                href={talent.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-sm hover:text-white transition-colors break-all"
              >
                {talent.portfolio_url}
              </a>
            </div>
          )}

          {talent.supplementary_url && (
            <div>
              <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white mb-1">
                Supplementary Material
              </p>
              <a
                href={talent.supplementary_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-sm hover:text-white transition-colors break-all"
              >
                {talent.supplementary_url}
              </a>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
