import Link from 'next/link'

export function Logo({ href = '/', className = '' }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={`font-display text-xs tracking-[4px] uppercase transition-colors ${className || 'text-white hover:text-[#ccc]'}`}
    >
      Dublin Independent Fashion Week
    </Link>
  )
}
