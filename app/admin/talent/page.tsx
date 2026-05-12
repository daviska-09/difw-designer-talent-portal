import { createServiceClient } from '@/lib/supabase/server'
import { AdminTalentClient } from './AdminTalentClient'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Talent Admin — DIFW' }

export default async function AdminTalentPage() {
  const supabase = createServiceClient()
  const { data: applications } = await supabase
    .from('talent_applications')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminTalentClient initialApplications={applications ?? []} />
}
