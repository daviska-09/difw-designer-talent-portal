export const metadata = { title: 'Announcements — DIFW' }

export default function AnnouncementsPage() {
  return (
    <div className="px-8 py-12 max-w-4xl mx-auto">
      <p className="text-xs tracking-[3px] uppercase font-ui font-semibold text-white mb-3">
        Member Area
      </p>
      <h1 className="font-display text-4xl tracking-[3px] uppercase mb-8">Announcements</h1>
      <div className="border-t border-[#1a1a1a] pt-16 text-center">
        <p className="font-display text-2xl tracking-[3px] uppercase text-white mb-4">
          Nothing Here Yet
        </p>
        <p className="text-white text-sm max-w-sm mx-auto">
          Announcements from the DIFW team will appear here.
        </p>
      </div>
    </div>
  )
}
