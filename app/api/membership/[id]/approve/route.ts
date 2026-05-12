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

    const { data, error } = await service
      .from('membership_applications')
      .update({ status: 'approved' })
      .eq('id', params.id)
      .select()
      .single()

    if (error || !data) {
      console.error('Approve update error:', error)
      return NextResponse.json({ error: error?.message ?? 'Update failed — no data returned' }, { status: 500 })
    }

    await sendMembershipApproval(data.email, data.full_name, data.membership_tier, payment_link, payment_amount)

    if (data.airtable_record_id) {
      updateMembershipStatusInAirtable(data.airtable_record_id, 'approved').catch(console.error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Membership approve error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
