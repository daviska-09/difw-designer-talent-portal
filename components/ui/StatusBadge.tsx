type Status = 'pending' | 'approved' | 'rejected' | 'paid' | 'accepted' | 'deferred'

const colours: Record<Status, string> = {
  pending: 'border-white text-white',
  approved: 'border-white text-white',
  accepted: 'border-emerald-600 text-emerald-500',
  rejected: 'border-[#555] text-white',
  deferred: 'border-amber-500 text-amber-400',
  paid: 'border-emerald-600 text-emerald-500',
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-block border px-3 py-1 text-xs tracking-[2px] uppercase font-ui font-semibold ${colours[status]}`}
    >
      {status}
    </span>
  )
}
