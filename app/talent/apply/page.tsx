import { Logo } from '@/components/layout/Logo'
import { TalentApplicationForm } from '@/components/forms/TalentApplicationForm'

export const metadata = {
  title: 'Talent Directory — DIFW',
}

export default function TalentApplyPage() {
  return (
    <div className="min-h-screen bg-white form-light">
      {/* Hero — photo background */}
      <div
        className="relative bg-cover"
        style={{ backgroundImage: "url('/hero-membership.jpg')", backgroundPosition: 'center 20%' }}
      >
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative">
          <header className="border-b border-white/20 px-8 py-6">
            <Logo />
          </header>
          <div className="max-w-2xl mx-auto px-8 pt-12 pb-16">
            <img
              src="/logo.webp"
              alt="Dublin Independent Fashion Week"
              className="w-32 sm:w-40 mb-8 opacity-90"
            />
            <h1 className="font-display text-7xl sm:text-9xl tracking-[4px] uppercase mb-4 text-white leading-none">
              Talent
            </h1>
            <h2 className="font-display text-4xl sm:text-5xl tracking-[3px] uppercase mb-6 text-white">
              Directory
            </h2>
            <p className="text-white/75 leading-relaxed max-w-lg mb-4">
              Submit your information and portfolio below to become part of the DIFW community and join our members-only DIFW Talent Directory.
            </p>
            <p className="text-white/75 leading-relaxed max-w-lg mb-4">
              Our members regularly draw on this database to find creative talent for shows, shoots, events, and collaborations both during Dublin Independent Fashion Week and throughout the year.
            </p>
            <p className="text-white/75 leading-relaxed max-w-lg">
              Please note that inclusion in the directory does not guarantee work opportunities or direct outreach from members.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-8 py-12">
        <div className="border-t border-[#E5E5E5] pt-12">
          <TalentApplicationForm />
        </div>
      </main>
    </div>
  )
}
