import { createServiceClient } from '@/lib/supabase/server'
import { AnnouncementsFeed } from '@/components/announcements/AnnouncementsFeed'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Announcements — DIFW' }

export default async function AnnouncementsPage() {
  const supabase = createServiceClient()

  const { data, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range(0, 9)

  return (
    <div className="px-8 py-12 max-w-4xl mx-auto">
      <p className="text-xs tracking-[3px] uppercase font-ui font-semibold text-white mb-3">
        DIFW Portal
      </p>
      <h1 className="font-display text-4xl tracking-[3px] uppercase mb-8">Announcements</h1>

      <AnnouncementsFeed initialPosts={data ?? []} initialTotal={count ?? 0} />
    </div>
  )
}
