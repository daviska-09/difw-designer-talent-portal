import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'

export default function JoinTalentPage() {
  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      <header className="border-b border-[#1a1a1a] px-8 py-4 flex items-center justify-between">
        <Logo href="/jointalent" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 pb-8 text-center">
        <img
          src="/logo.webp"
          alt="Dublin Independent Fashion Week"
          className="w-28 sm:w-36 mb-4"
        />
        <h1 className="font-display text-3xl sm:text-4xl tracking-[4px] uppercase mb-3 text-white">
          Talent Directory
        </h1>
        <p className="text-white mb-6 max-w-sm leading-relaxed text-sm">
          Join the Dublin Independent Fashion Week Talent Directory and connect with our community.
        </p>

        <Link
          href="/talent/apply"
          className="px-8 py-3 bg-white text-black font-display text-sm tracking-[3px] uppercase hover:bg-[#e0e0e0] transition-colors"
        >
          Submit to Talent Directory
        </Link>
      </main>
    </div>
  )
}
