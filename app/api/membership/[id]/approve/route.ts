import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendMembershipApproval } from '@/lib/resend'
import { updateMembershipStatusInAirtable } from '@/lib/airtable'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { payment_link, payment_amount } = await request.json()
    if (!payment_link || !payment_amount) {
      return NextResponse.json({ error: 'Payment link and amount are required' }, { status: 400 })
    }

    const service = createServiceClient()

    const { data: rows, error: fetchError } = await service
      .from('membership_applications')
      .select('*')
      .eq('id', params.id)

    if (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const app = rows?.[0]
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const { error: updateError } = await service
      .from('membership_applications')
      .update({ status: 'approved' })
      .eq('id', params.id)

    if (updateError) {
      console.error('Approve update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    await sendMembershipApproval(app.email, app.full_name, app.membership_tier, payment_link, payment_amount)

    if (app.airtable_record_id) {
      updateMembershipStatusInAirtable(app.airtable_record_id, 'approved').catch(console.error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Membership approve error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
