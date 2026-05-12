import { createServiceClient } from '@/lib/supabase/server'
import { AdminMembershipClient } from './AdminMembershipClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Membership Admin — DIFW' }

export default async function AdminMembershipPage() {
  const supabase = createServiceClient()
  const { data: applications } = await supabase
    .from('membership_applications')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminMembershipClient initialApplications={applications ?? []} />
}
