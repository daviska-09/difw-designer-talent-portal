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

  return <AccountClient user={user} member={member} />
}
