import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendMemberWelcome } from '@/lib/resend'
import { updateMembershipRecord } from '@/lib/airtable'

// Expected body from Airtable automation:
// {
//   "airtable_record_id": "{Record ID}",
//   "email": "{Email}",
//   "full_name": "{Full Name}",
//   "brand_name": "{Brand Name}",
//   "membership_tier": "{Membership Tier}"
// }

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-difw-secret')
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { airtable_record_id, email, full_name, brand_name, membership_tier } = body

    if (!email || !full_name) {
      return NextResponse.json({ error: 'Missing required fields: email, full_name' }, { status: 400 })
    }

    const service = createServiceClient()

    // Create Supabase auth user (no password — member sets one via magic link)
    const { data: authData, error: authError } = await service.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        role: 'member',
        full_name,
        brand_name: brand_name ?? '',
        membership_tier: membership_tier ?? '',
      },
    })

    if (authError) {
      // 422 = user already exists — treat as idempotent success
      if (authError.status === 422) {
        console.log(`User already exists for ${email} — skipping duplicate activation`)
        return NextResponse.json({ success: true, skipped: true })
      }
      console.error('Auth user creation error:', authError)
      return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
    }

    const userId = authData.user.id

    // Insert member record
    await service.from('members').insert({
      id: userId,
      full_name,
      brand_name: brand_name ?? null,
      email,
      membership_tier: membership_tier ?? null,
    })

    // Generate magic link for first login
    const { data: linkData, error: linkError } = await service.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/members/setup`,
      },
    })

    if (linkError || !linkData?.properties?.action_link) {
      console.error('Magic link generation error:', linkError)
      return NextResponse.json({ error: 'Failed to generate magic link' }, { status: 500 })
    }

    const magicLink = linkData.properties.action_link

    // Send welcome email with magic link
    await sendMemberWelcome(email, full_name, magicLink)

    // Write Supabase User ID back to Airtable
    if (airtable_record_id) {
      await updateMembershipRecord(airtable_record_id, { 'Supabase User ID': userId })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('membership-paid webhook error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
