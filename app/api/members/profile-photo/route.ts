import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const BUCKET = 'membership-uploads'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('photo') as File | null
    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const service = createServiceClient()
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `profile-photos/${user.id}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await service.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = service.storage.from(BUCKET).getPublicUrl(path)

    await service.from('members').update({ profile_photo_url: publicUrl }).eq('id', user.id)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('Profile photo upload error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
