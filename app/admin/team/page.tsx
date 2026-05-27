import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminTeamClient } from './AdminTeamClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Team — DIFW Admin' }

export default async function AdminTeamPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') redirect('/admin/login')

  const service = createServiceClient()
  const { data: { users } } = await service.auth.admin.listUsers({ perPage: 1000 })

  const admins = users
    .filter(u => u.user_metadata?.role === 'admin')
    .map(u => ({
      id: u.id,
      email: u.email ?? '',
      full_name: (u.user_metadata?.full_name as string) ?? null,
      created_at: u.created_at,
    }))

  return <AdminTeamClient admins={admins} currentUserId={user.id} />
}
