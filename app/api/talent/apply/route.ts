import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { syncTalentToAirtable } from '@/lib/airtable'
import { sendTalentConfirmation } from '@/lib/resend'
import { normalizeUrl } from '@/lib/normalizeUrl'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      full_name, business_name, location, email, phone,
      services, services_other, about_me, consent,
      headshot_url, supplementary_url,
    } = body
    const portfolio_url = normalizeUrl(body.portfolio_url) ?? ''
    const instagram_website = normalizeUrl(body.instagram_website)

    if (!full_name || !location || !email || !phone || !about_me || !consent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!portfolio_url) {
      return NextResponse.json({ error: 'Portfolio link is required' }, { status: 400 })
    }
    if (!headshot_url) {
      return NextResponse.json({ error: 'Headshot is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: existing } = await supabase
      .from('talent_applications')
      .select('id')
      .eq('email', email)
      .limit(1)
      .single()
    if (existing) {
      return NextResponse.json({ error: 'A submission already exists for this email.' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('talent_applications')
      .insert({
        full_name,
        business_name: business_name || null,
        location,
        email,
        phone: phone || null,
        instagram_website: instagram_website || null,
        services: services || [],
        services_other: services_other || null,
        portfolio_url,
        headshot_url,
        supplementary_url: supplementary_url || null,
        about_me,
        consent,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'An application with this email address already exists.' }, { status: 409 })
      }
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
    }

    syncTalentToAirtable(data).then(async (airtableId) => {
      if (airtableId) {
        await supabase.from('talent_applications').update({ airtable_record_id: airtableId }).eq('id', data.id)
      }
    })

    await sendTalentConfirmation(email, full_name).catch(console.error)

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Talent apply error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
