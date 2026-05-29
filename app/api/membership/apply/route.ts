import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { syncMembershipToAirtable } from '@/lib/airtable'
import { sendMembershipConfirmation } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      full_name, brand_name, location, email, phone, instagram, website_url,
      membership_tier, about_work, why_join, difw26_participation,
      values_agreement, consent_contact, consent_profile_sharing, consent_not_guaranteed,
      headshot_url, logo_url, supporting_docs_url, emerging_proof_url,
    } = body

    if (
      !full_name || !brand_name || !location || !email || !phone ||
      !membership_tier || !about_work || !why_join || !difw26_participation ||
      !values_agreement || !consent_contact || !consent_profile_sharing || !consent_not_guaranteed
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!logo_url) {
      return NextResponse.json({ error: 'Logo is required' }, { status: 400 })
    }
    if (membership_tier === 'emerging_designer' && !emerging_proof_url) {
      return NextResponse.json({ error: 'Proof of eligibility is required for Emerging Designer' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: existing } = await supabase
      .from('membership_applications')
      .select('id')
      .eq('email', email)
      .limit(1)
      .single()
    if (existing) {
      return NextResponse.json({ error: 'A submission already exists for this email.' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('membership_applications')
      .insert({
        full_name,
        brand_name,
        location,
        email,
        phone,
        instagram: instagram || null,
        website_url: website_url || null,
        membership_tier,
        about_work,
        why_join,
        difw26_participation,
        headshot_url: headshot_url || null,
        logo_url,
        supporting_docs_url: supporting_docs_url || null,
        emerging_proof_url: emerging_proof_url || null,
        values_agreement,
        consent_contact,
        consent_profile_sharing,
        consent_not_guaranteed,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
    }

    syncMembershipToAirtable(data).then(async (airtableId) => {
      if (airtableId) {
        await supabase.from('membership_applications').update({ airtable_record_id: airtableId }).eq('id', data.id)
      }
    })

    await sendMembershipConfirmation(email, full_name).catch(console.error)

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Membership apply error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
