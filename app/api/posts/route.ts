import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createClient } from '@/lib/supabase/server'
import { syncPostToAirtable } from '@/lib/airtable'

const BUCKET = 'post-images'

async function uploadPhoto(
  supabase: ReturnType<typeof createServiceClient>,
  file: File,
  postId: string
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${postId}/feature.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (error) throw new Error(`Upload failed: ${error.message}`)
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

// GET — public, returns published posts (for member feed pagination)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('perPage') ?? '10', 10)))
    const all = searchParams.get('all') === 'true'

    const supabase = createServiceClient()
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    let query = supabase.from('posts').select('*', { count: 'exact' })
    if (!all) query = query.eq('is_published', true)
    query = query.order('published_at', { ascending: false }).range(from, to)

    const { data, error, count } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ posts: data ?? [], total: count ?? 0 })
  } catch (err) {
    console.error('Posts GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — admin only, creates a post
export async function POST(request: NextRequest) {
  try {
    const authClient = createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const headline = formData.get('headline') as string
    const body_text = formData.get('body_text') as string
    const hyperlink = (formData.get('hyperlink') as string)?.trim() || null
    const published_at = formData.get('published_at') as string | null
    const is_published = formData.get('is_published') === 'true'
    const photoFile = formData.get('feature_photo') as File | null

    if (!headline?.trim()) {
      return NextResponse.json({ error: 'Headline is required' }, { status: 400 })
    }
    if (!body_text?.trim() || body_text.trim().length < 20) {
      return NextResponse.json({ error: 'Body text must be at least 20 characters' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const postId = crypto.randomUUID()

    let feature_photo_url: string | null = null
    if (photoFile && photoFile.size > 0) {
      if (photoFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Photo must be under 5MB' }, { status: 400 })
      }
      feature_photo_url = await uploadPhoto(supabase, photoFile, postId)
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        id: postId,
        headline: headline.trim(),
        body_text: body_text.trim(),
        feature_photo_url,
        hyperlink,
        published_at: published_at || new Date().toISOString(),
        is_published,
        admin_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to save post' }, { status: 500 })
    }

    // Sync to Airtable (non-blocking)
    syncPostToAirtable(data).then(async (airtableId) => {
      if (airtableId) {
        await supabase.from('posts').update({ airtable_record_id: airtableId }).eq('id', data.id)
      }
    }).catch(console.error)

    return NextResponse.json({ success: true, post: data })
  } catch (err) {
    console.error('Post create error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
