import { createServiceClient } from '@/lib/supabase/server'
import { AdminEventsClient } from './AdminEventsClient'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Events Admin — DIFW' }

export default async function AdminEventsPage() {
  const supabase = createServiceClient()
  const { data: submissions } = await supabase
    .from('event_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminEventsClient initialSubmissions={submissions ?? []} />
}
