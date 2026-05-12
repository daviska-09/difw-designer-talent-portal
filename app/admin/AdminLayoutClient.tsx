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
    <div className="min-h-screen bg-black flex">

      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 border-r border-[#1a1a1a] flex flex-col sticky top-0 h-screen">
        <div className="px-6 py-6 border-b border-[#1a1a1a]">
          <Logo />
        </div>

        <nav className="flex flex-col p-4 gap-1 flex-1">
          <Link
            href="/admin/talent"
            className={`px-4 py-3 font-display text-sm tracking-[3px] uppercase transition-colors ${
              pathname.startsWith('/admin/talent')
                ? 'bg-white text-black'
                : 'text-[#888] hover:text-white hover:bg-[#111]'
            }`}
          >
            Talent
          </Link>
          <Link
            href="/admin/membership"
            className={`px-4 py-3 font-display text-sm tracking-[3px] uppercase transition-colors ${
              pathname.startsWith('/admin/membership')
                ? 'bg-white text-black'
                : 'text-[#888] hover:text-white hover:bg-[#111]'
            }`}
          >
            Membership
          </Link>
        </nav>

        <div className="px-6 py-5 border-t border-[#1a1a1a]">
          <span className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#444]">
            Admin
          </span>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">{children}</main>

    </div>
  )
}
