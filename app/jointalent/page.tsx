import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'

export default function JoinTalentPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="border-b border-[#1a1a1a] px-8 py-6 flex items-center justify-between">
        <Logo />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-8 text-center">
        <img
          src="/logo.webp"
          alt="Dublin Independent Fashion Week"
          className="w-48 sm:w-64 mb-6"
        />
        <h1 className="font-display text-5xl sm:text-7xl tracking-[4px] uppercase mb-4 text-white">
          Talent Database
        </h1>
        <p className="text-white mb-8 max-w-sm leading-relaxed text-sm">
          Join the Dublin Independent Fashion Week talent database and connect with our community.
        </p>

        <Link
          href="/talent/apply"
          className="px-8 py-3 bg-white text-black font-display text-sm tracking-[3px] uppercase hover:bg-[#e0e0e0] transition-colors"
        >
          Join Talent Database
        </Link>
      </main>
    </div>
  )
}
