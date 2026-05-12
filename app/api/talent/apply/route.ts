import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { syncTalentToAirtable } from '@/lib/airtable'
import { sendTalentConfirmation } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      first_name,
      last_name,
      business_name,
      email,
      phone,
      services,
      services_other,
      portfolio_url,
      supplementary_url,
      about_me,
      consent,
    } = body

    if (!first_name || !last_name || !email || !about_me || !consent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('talent_applications')
      .insert({
        first_name,
        last_name,
        business_name: business_name || null,
        email,
        phone: phone || null,
        services: services || [],
        services_other: services_other || null,
        portfolio_url: portfolio_url || null,
        supplementary_url: supplementary_url || null,
        about_me,
        consent,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
    }

    // Sync to Airtable (non-blocking)
    syncTalentToAirtable(data).then(async (airtableId) => {
      if (airtableId) {
        await supabase
          .from('talent_applications')
          .update({ airtable_record_id: airtableId })
          .eq('id', data.id)
      }
    })

    // Send confirmation email (non-blocking)
    sendTalentConfirmation(email, first_name).catch(console.error)

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Talent apply error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
