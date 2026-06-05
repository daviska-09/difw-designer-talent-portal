import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'

export default function HomePage() {
  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      <header className="border-b border-[#1a1a1a] px-8 py-4 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-8">
          <Link
            href="/login"
            className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/admin/login"
            className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white hover:text-white transition-colors"
          >
            Admin
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 pb-8 text-center">
        <img
          src="/logo.webp"
          alt="Dublin Independent Fashion Week"
          className="w-[min(360px,70vw)] mb-12"
        />

        <div className="flex flex-col sm:flex-row gap-6">
          <Link
            href="/membership/apply"
            className="px-10 py-4 bg-white text-black font-display text-lg tracking-[3px] uppercase hover:bg-[#e0e0e0] transition-colors"
          >
            Apply for Membership
          </Link>
          <Link
            href="/talent/apply"
            className="px-10 py-4 bg-transparent border border-white text-white font-display text-lg tracking-[3px] uppercase hover:bg-white hover:text-black transition-colors"
          >
            Submit to Talent Directory
          </Link>
        </div>

      </main>
    </div>
  )
}
