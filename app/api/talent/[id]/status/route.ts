import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { updateTalentStatusInAirtable } from '@/lib/airtable'
import { sendTalentApproval, sendTalentRejection } from '@/lib/resend'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin session
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await request.json()
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const service = createServiceClient()

    const { data, error } = await service
      .from('talent_applications')
      .update({ status })
      .eq('id', params.id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    // Sync to Airtable
    if (data.airtable_record_id) {
      updateTalentStatusInAirtable(data.airtable_record_id, status).catch(console.error)
    }

    // Send email
    if (status === 'approved') {
      sendTalentApproval(data.email, data.first_name).catch(console.error)
    } else {
      sendTalentRejection(data.email, data.first_name).catch(console.error)
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Talent status update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
