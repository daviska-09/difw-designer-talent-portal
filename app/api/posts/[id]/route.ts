import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createClient } from '@/lib/supabase/server'
import { updatePostInAirtable, deletePostFromAirtable } from '@/lib/airtable'

const BUCKET = 'post-images'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const remove_photo = formData.get('remove_photo') === 'true'

    if (!headline?.trim()) {
      return NextResponse.json({ error: 'Headline is required' }, { status: 400 })
    }
    if (!body_text?.trim() || body_text.trim().length < 20) {
      return NextResponse.json({ error: 'Body text must be at least 20 characters' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: existing } = await supabase
      .from('posts')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    let feature_photo_url = existing.feature_photo_url

    if (remove_photo) {
      feature_photo_url = null
    } else if (photoFile && photoFile.size > 0) {
      if (photoFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Photo must be under 5MB' }, { status: 400 })
      }
      const buffer = Buffer.from(await photoFile.arrayBuffer())
      const ext = photoFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${params.id}/feature.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType: photoFile.type, upsert: true })

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)
      feature_photo_url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
    }

    const { data, error } = await supabase
      .from('posts')
      .update({
        headline: headline.trim(),
        body_text: body_text.trim(),
        feature_photo_url,
        hyperlink,
        published_at: published_at || existing.published_at,
        is_published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
    }

    // Sync to Airtable (non-blocking)
    if (existing.airtable_record_id) {
      updatePostInAirtable(existing.airtable_record_id, {
        'Headline': headline.trim(),
        'Body': body_text.trim(),
        'Photo URL': feature_photo_url ?? '',
        'Link': hyperlink ?? '',
        'Status': is_published ? 'Published' : 'Draft',
      }).catch(console.error)
    }

    return NextResponse.json({ success: true, post: data })
  } catch (err) {
    console.error('Post update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authClient = createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    const { data: existing } = await supabase
      .from('posts')
      .select('id, airtable_record_id')
      .eq('id', params.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const { error } = await supabase.from('posts').delete().eq('id', params.id)
    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
    }

    // Sync to Airtable (non-blocking)
    if (existing.airtable_record_id) {
      deletePostFromAirtable(existing.airtable_record_id).catch(console.error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Post delete error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
