import { NextRequest, NextResponse } from 'next/server'
import { sendMembershipApproval } from '@/lib/resend'
import { updateMembershipRecord } from '@/lib/airtable'

// Expected body from Airtable automation (configure in Airtable → Automations → Send POST request):
// {
//   "airtable_record_id": "{Record ID}",
//   "email": "{Email}",
//   "full_name": "{Full Name}",
//   "payment_link": "{Payment Link}",
//   "payment_amount": "{Payment Amount}",
//   "membership_tier": "{Membership Tier}"
// }

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-difw-secret')
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { airtable_record_id, email, full_name, payment_link, payment_amount, membership_tier } = body

    if (!email || !full_name || !payment_link) {
      return NextResponse.json({ error: 'Missing required fields: email, full_name, payment_link' }, { status: 400 })
    }

    await sendMembershipApproval(email, full_name, membership_tier ?? '', payment_link, payment_amount ?? '')

    // Mark approval email sent in Airtable
    if (airtable_record_id) {
      await updateMembershipRecord(airtable_record_id, { 'Magic Link Sent': true })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('membership-approved webhook error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
