export const metadata = { title: 'Events — DIFW' }

export default function EventsPage() {
  return (
    <div className="px-8 py-12 max-w-4xl mx-auto">
      <p className="text-xs tracking-[3px] uppercase font-ui font-semibold text-white mb-3">
        Member Area
      </p>
      <h1 className="font-display text-4xl tracking-[3px] uppercase mb-8">Events</h1>
      <div className="border-t border-[#1a1a1a] pt-16 text-center">
        <p className="font-display text-2xl tracking-[3px] uppercase text-white mb-4">
          Events Coming Soon
        </p>
        <p className="text-white text-sm max-w-sm mx-auto">
          Details of upcoming DIFW events will be posted here. Stay tuned.
        </p>
      </div>
    </div>
  )
}
