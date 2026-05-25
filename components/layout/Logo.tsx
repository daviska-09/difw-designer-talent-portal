import Link from 'next/link'

export function Logo({ href = '/', className = '' }: { href?: string; className?: string }) {
  return (
    <Link href={href} className="inline-block">
      <img
        src="/logo.webp"
        alt="Dublin Independent Fashion Week"
        className={`h-10 w-auto ${className}`}
      />
    </Link>
  )
}
