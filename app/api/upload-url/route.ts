import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const ALLOWED_BUCKETS = ['talent-uploads', 'membership-uploads', 'event-uploads']

export async function POST(request: NextRequest) {
  try {
    const { bucket, path } = await request.json()

    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
    }
    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path)

    if (error || !data) {
      console.error('Signed URL error:', error)
      return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
    }

    const publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl

    return NextResponse.json({ token: data.token, path: data.path, publicUrl })
  } catch (err) {
    console.error('Upload URL error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
