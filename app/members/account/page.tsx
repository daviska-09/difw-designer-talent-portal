import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountClient } from './AccountClient'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Account — DIFW' }

export default async function AccountPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('id', user.id)
    .single()

  let headshotUrl: string | null = null
  if (member?.membership_application_id) {
    const { data: application } = await supabase
      .from('membership_applications')
      .select('headshot_url')
      .eq('id', member.membership_application_id)
      .single()
    headshotUrl = application?.headshot_url ?? null
  }

  return <AccountClient user={user} member={member} headshotUrl={headshotUrl} />
}
