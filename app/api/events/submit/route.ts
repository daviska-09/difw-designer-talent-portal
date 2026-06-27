import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEventSubmissionConfirmation } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      lead_applicant_name, email, phone, brand_name, website, social_links,
      practice_description, work_category, work_category_other,
      event_title, event_type, event_type_other, event_collaboration, collaborators,
      open_to_alternatives, event_description, event_access, intended_audience,
      estimated_attendees, event_concept, why_difw26, supporting_materials_url,
      venue_secured, venue_details, venue_preference, preferred_dates,
      preferred_time, event_duration, technical_requirements,
      confirm_accurate, confirm_not_guaranteed, confirm_deadline, additional_info,
    } = body

    if (!lead_applicant_name || !email || !phone || !brand_name) {
      return NextResponse.json({ error: 'Missing required applicant fields' }, { status: 400 })
    }
    if (!event_title || !event_type || !event_collaboration) {
      return NextResponse.json({ error: 'Missing required event fields' }, { status: 400 })
    }
    if (!confirm_accurate || !confirm_not_guaranteed || !confirm_deadline) {
      return NextResponse.json({ error: 'All declaration boxes must be checked' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('event_submissions')
      .insert({
        lead_applicant_name,
        email,
        phone,
        brand_name,
        website: website || null,
        social_links: social_links || null,
        practice_description: practice_description || null,
        work_category: work_category || null,
        work_category_other: work_category_other || null,
        event_title,
        event_type,
        event_type_other: event_type_other || null,
        event_collaboration,
        collaborators: collaborators || null,
        open_to_alternatives: open_to_alternatives || null,
        event_description: event_description || null,
        event_access: event_access || null,
        intended_audience: intended_audience || null,
        estimated_attendees: estimated_attendees || null,
        event_concept: event_concept || null,
        why_difw26: why_difw26 || null,
        supporting_materials_url: supporting_materials_url || null,
        venue_secured: venue_secured || null,
        venue_details: venue_details || null,
        venue_preference: venue_preference || null,
        preferred_dates: preferred_dates ?? [],
        preferred_time: preferred_time || null,
        event_duration: event_duration || null,
        technical_requirements: technical_requirements || null,
        confirm_accurate,
        confirm_not_guaranteed,
        confirm_deadline,
        additional_info: additional_info || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
    }

    await sendEventSubmissionConfirmation(email, lead_applicant_name, event_title, event_type).catch(console.error)

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Event submission error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
