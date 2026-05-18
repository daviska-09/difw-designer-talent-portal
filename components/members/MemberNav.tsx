'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/layout/Logo'

const NAV_LINKS = [
  { href: '/members/talent', label: 'Talent' },
  { href: '/members/events', label: 'Events' },
  { href: '/members/announcements', label: 'Announcements' },
  { href: '/members/account', label: 'Account' },
]

export function MemberNav() {
  const pathname = usePathname()

  return (
    <header className="border-b border-[#1a1a1a] px-8 py-5 flex items-center justify-between">
      <Logo href="/members/talent" />
      <nav className="flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`font-display text-sm tracking-[3px] uppercase transition-colors ${
              pathname === link.href ? 'text-white' : 'text-[#888] hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
