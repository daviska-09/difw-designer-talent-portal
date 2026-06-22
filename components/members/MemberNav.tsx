'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/layout/Logo'

const NAV_LINKS = [
  { href: '/members', label: 'Home' },
  { href: '/members/talent', label: 'Talent' },
  { href: '/members/announcements', label: 'Announcements' },
  { href: '/members/account', label: 'Account' },
]

export function MemberNav() {
  const pathname = usePathname()
  const [showEventModal, setShowEventModal] = useState(false)

  return (
    <>
      <header className="border-b border-[#1a1a1a] px-8 py-5 flex items-center justify-between">
        <Logo href="/members" />
        <nav className="flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-display text-sm tracking-[3px] uppercase transition-colors ${
                pathname === link.href ? 'text-white' : 'text-white hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => setShowEventModal(true)}
            className="font-display text-sm tracking-[3px] uppercase text-[#888] hover:text-white transition-colors"
          >
            + Event Submission
          </button>
        </nav>
      </header>

      {showEventModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowEventModal(false)}
        >
          <div
            className="bg-[#111] border border-[#333] px-10 py-10 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-display text-xl tracking-[3px] uppercase text-white mb-4">
              Event Submission
            </p>
            <p className="font-body text-sm text-[#999] leading-relaxed">
              Check back here soon.
            </p>
            <button
              onClick={() => setShowEventModal(false)}
              className="mt-8 font-ui text-xs tracking-[2px] uppercase text-[#666] hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
