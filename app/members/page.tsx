import Link from 'next/link'

export const metadata = { title: 'Welcome — DIFW Portal' }

export default function MembersHomePage() {
  return (
    <div className="flex items-center justify-center px-8" style={{ minHeight: 'calc(100vh - 73px)' }}>
      <div className="max-w-xl w-full text-center py-12">
        <img
          src="/logo.webp"
          alt="Dublin Independent Fashion Week"
          className="w-24 mx-auto mb-8"
        />

        <h1 className="font-display text-3xl sm:text-4xl tracking-[4px] uppercase text-white mb-8">
          Welcome to the DIFW Portal
        </h1>

        <div className="space-y-5 text-white/75 text-sm leading-relaxed font-body text-left">
          <p>
            Thank you for being part of Dublin Independent Fashion Week. Since our first event in 2023, DIFW has grown enormously, and none of it would have been possible without the support, creativity, and energy of our community. We are incredibly grateful to have you as part of this movement.
          </p>
          <p>
            Within this members-only space, you&apos;ll be able to access our ever-growing{' '}
            <Link href="/members/talent" className="text-white underline hover:text-white/80 transition-colors">
              Talent Directory
            </Link>
            , keep up to date with exclusive{' '}
            <Link href="/members/announcements" className="text-white underline hover:text-white/80 transition-colors">
              events and announcements
            </Link>
            , and manage your DIFW membership throughout the year.
          </p>
          <p>
            If you have any questions, feel free to reach out to{' '}
            <a href="mailto:info@dublin-ifw.com" className="text-white underline hover:text-white/80 transition-colors">
              info@dublin-ifw.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
