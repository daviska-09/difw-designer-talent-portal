import { EventSubmissionForm } from '@/components/forms/EventSubmissionForm'

export const metadata = { title: 'Event Submission — DIFW' }

export default function EventSubmissionPage() {
  return (
    <div className="bg-white min-h-screen form-light">
      <div className="px-8 py-12 max-w-2xl mx-auto">
        <p className="text-xs tracking-[3px] uppercase font-ui font-semibold text-[#888] mb-3">
          DIFW Portal
        </p>
        <h1 className="font-display text-4xl tracking-[3px] uppercase text-black mb-2">
          Event Submission
        </h1>
        <p className="font-display text-xl tracking-[3px] uppercase text-[#888] mb-10">
          DIFW26
        </p>

        <EventSubmissionForm />
      </div>
    </div>
  )
}
