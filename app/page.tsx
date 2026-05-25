import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'

export default function HomePage() {
  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      <header className="border-b border-[#1a1a1a] px-8 py-4 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-8">
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
          className="w-28 sm:w-36 mb-4"
        />
        <h1 className="font-display text-3xl sm:text-4xl tracking-[4px] uppercase mb-3 text-white">
          DIFW Portal
        </h1>
        <p className="text-white mb-2 max-w-md leading-relaxed text-sm">
          Welcome to the DIFW Portal!
        </p>
        <p className="text-white/70 mb-8 max-w-md leading-relaxed text-sm">
          Thank you for being part of Dublin Independent Fashion Week. Since our first event in 2023, DIFW has grown enormously, and none of it would have been possible without the support, creativity, and energy of our community. We are incredibly grateful to have you as part of this movement.
        </p>
        <p className="text-white/70 mb-8 max-w-md leading-relaxed text-sm">
          Within this members-only space, you&apos;ll be able to access our ever-growing Talent Directory, keep up to date with exclusive events and opportunities, and manage your DIFW membership throughout the year.
        </p>
        <p className="text-white/70 mb-10 max-w-md leading-relaxed text-sm">
          If you have any questions, feel free to reach out to{' '}
          <a href="mailto:info@dublin-ifw.com" className="underline text-white/70 hover:text-white">info@dublin-ifw.com</a>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Link
            href="/membership/apply"
            className="px-8 py-3 bg-white text-black font-display text-sm tracking-[3px] uppercase hover:bg-[#e0e0e0] transition-colors"
          >
            Apply for Membership
          </Link>
          <Link
            href="/talent/apply"
            className="px-8 py-3 bg-transparent border border-white text-white font-display text-sm tracking-[3px] uppercase hover:bg-white hover:text-black transition-colors"
          >
            Submit to Talent Directory
          </Link>
        </div>

        <Link
          href="/login"
          className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white/50 hover:text-white transition-colors"
        >
          Login
        </Link>

      </main>
    </div>
  )
}
