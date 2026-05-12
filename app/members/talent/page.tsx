import { createClient } from '@/lib/supabase/server'
import { TalentDirectoryClient } from './TalentDirectoryClient'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Talent Directory — DIFW' }

export default async function MembersTalentPage() {
  const supabase = createClient()
  const { data: talent } = await supabase
    .from('talent_applications')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return <TalentDirectoryClient initialTalent={talent ?? []} />
}
