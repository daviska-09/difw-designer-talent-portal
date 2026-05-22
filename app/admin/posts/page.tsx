import { createServiceClient } from '@/lib/supabase/server'
import { AdminPostsClient } from '@/components/admin/AdminPostsClient'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Posts Admin — DIFW' }

export default async function AdminPostsPage() {
  const supabase = createServiceClient()

  const { data, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, 9)

  return <AdminPostsClient initialPosts={data ?? []} initialTotal={count ?? 0} />
}
