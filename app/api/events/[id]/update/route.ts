import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const ALLOWED_FIELDS = [
  'lead_applicant_name',
  'email',
  'phone',
  'brand_name',
  'website',
  'social_links',
  'practice_description',
  'work_category',
  'work_category_other',
  'event_title',
  'event_type',
  'event_type_other',
  'event_collaboration',
  'collaborators',
  'open_to_alternatives',
  'event_description',
  'event_access',
  'intended_audience',
  'estimated_attendees',
  'event_concept',
  'why_difw26',
  'supporting_materials_url',
  'venue_secured',
  'venue_details',
  'venue_preference',
  'preferred_dates',
  'preferred_time',
  'event_duration',
  'technical_requirements',
  'additional_info',
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
      .from('event_submissions')
      .update(updates)
      .eq('id', params.id)

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Event update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
