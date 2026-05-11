'use client'

interface ChipProps {
  label: string
  active?: boolean
  light?: boolean
  onClick?: () => void
  className?: string
}

export function Chip({ label, active = false, light = false, onClick, className = '' }: ChipProps) {
  const colors = light
    ? active
      ? 'border-black text-black'
      : 'border-[#ccc] text-[#888] hover:border-[#888] hover:text-[#555]'
    : active
      ? 'border-white text-white'
      : 'border-[#555] text-white hover:border-white hover:text-white'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center px-4 py-2 text-xs tracking-[2px] uppercase font-ui font-semibold
        border transition-colors
        ${colors}
        ${className}
      `}
    >
      {label}
    </button>
  )
}
