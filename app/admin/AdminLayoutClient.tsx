'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'
import { createClient } from '@/lib/supabase/client'

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

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

        <div className="px-4 py-4 border-t border-[#1a1a1a] flex flex-col gap-1">
          <span className="px-4 text-xs tracking-[2px] uppercase font-ui font-semibold text-[#444]">
            Admin
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-3 font-display text-sm tracking-[3px] uppercase text-[#888] hover:text-white hover:bg-[#111] transition-colors text-left"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">{children}</main>

    </div>
  )
}
