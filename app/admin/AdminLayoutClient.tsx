'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-black">{children}</div>
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-[#1a1a1a] px-8 py-5 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-8">
          <Link
            href="/admin/talent"
            className="font-display text-sm tracking-[3px] uppercase text-white hover:text-[#ccc] transition-colors"
          >
            Talent
          </Link>
          <Link
            href="/admin/membership"
            className="font-display text-sm tracking-[3px] uppercase text-white hover:text-[#ccc] transition-colors"
          >
            Membership
          </Link>
          <span className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white border border-[#444] px-3 py-1">
            Admin
          </span>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
