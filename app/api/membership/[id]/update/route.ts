import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const ALLOWED_FIELDS = [
  'full_name',
  'brand_name',
  'location',
  'email',
  'phone',
  'instagram',
  'website_url',
  'membership_tier',
  'difw26_participation',
  'about_work',
  'why_join',
  'headshot_url',
  'logo_url',
  'emerging_proof_url',
  'supporting_docs_url',
] as const

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const updates: Record<string, unknown> = {}
    for (const field of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const service = createServiceClient()
    const { error } = await service
      .from('membership_applications')
      .update(updates)
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Membership update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
