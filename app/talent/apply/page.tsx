import { Logo } from '@/components/layout/Logo'
import { TalentApplicationForm } from '@/components/forms/TalentApplicationForm'

export const metadata = {
  title: 'Apply — DIFW Talent Database',
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
            <Logo className="text-white/60 hover:text-white" />
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
              Apply
            </h2>
            <p className="text-white/75 leading-relaxed max-w-lg">
              Join the DIFW Talent Database and get discovered by our network of independent designers and brands. Approved profiles are visible to all DIFW members.
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
