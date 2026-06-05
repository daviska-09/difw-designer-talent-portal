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

  if (pathname === '/admin/login' || pathname === '/admin/forgot-password') {
    return <div className="min-h-screen bg-black">{children}</div>
  }

  return (
    <div className="min-h-screen bg-black flex">

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-[#1a1a1a] flex flex-col sticky top-0 h-screen">
        <div className="px-6 py-6 border-b border-[#1a1a1a]">
          <Logo href="/admin" className="h-14" />
        </div>

        <nav className="flex flex-col p-4 gap-2 flex-1">
          <Link
            href="/admin/talent"
            className={`px-4 py-4 font-display text-xl tracking-widest uppercase transition-all ${
              pathname.startsWith('/admin/talent')
                ? 'bg-white text-black'
                : 'text-white opacity-60 hover:opacity-100 hover:bg-[#111]'
            }`}
          >
            Talent
          </Link>
          <Link
            href="/admin/membership"
            className={`px-4 py-4 font-display text-xl tracking-widest uppercase transition-all ${
              pathname.startsWith('/admin/membership')
                ? 'bg-white text-black'
                : 'text-white opacity-60 hover:opacity-100 hover:bg-[#111]'
            }`}
          >
            Membership
          </Link>

          <Link
            href="/admin/posts"
            className={`px-4 py-4 font-display text-xl tracking-widest uppercase transition-all ${
              pathname.startsWith('/admin/posts')
                ? 'bg-white text-black'
                : 'text-white opacity-60 hover:opacity-100 hover:bg-[#111]'
            }`}
          >
            Posts
          </Link>
          <Link
            href="/admin/team"
            className={`px-4 py-4 font-display text-xl tracking-widest uppercase transition-all ${
              pathname.startsWith('/admin/team')
                ? 'bg-white text-black'
                : 'text-white opacity-60 hover:opacity-100 hover:bg-[#111]'
            }`}
          >
            Team
          </Link>
        </nav>

        <div className="px-4 py-4 border-t border-[#1a1a1a] flex flex-col gap-2">
          <button
            onClick={handleLogout}
            className="px-4 py-4 font-display text-xl tracking-widest uppercase text-white opacity-60 hover:opacity-100 hover:bg-[#111] transition-all text-left"
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
