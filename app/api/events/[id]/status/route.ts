import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendEventAccepted, sendEventDeferred } from '@/lib/resend'

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

    const { status } = await request.json()
    if (!['accepted', 'deferred', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const service = createServiceClient()

    const { data: submission, error: fetchError } = await service
      .from('event_submissions')
      .select('email, lead_applicant_name, event_title')
      .eq('id', params.id)
      .single()

    if (fetchError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const { error } = await service
      .from('event_submissions')
      .update({ status })
      .eq('id', params.id)

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

    let emailSent = false
    if (status === 'accepted') {
      try {
        await sendEventAccepted(submission.email, submission.lead_applicant_name, submission.event_title)
        emailSent = true
      } catch (emailErr) {
        console.error('Event accepted email error:', emailErr)
      }
    } else if (status === 'deferred') {
      try {
        await sendEventDeferred(submission.email, submission.lead_applicant_name, submission.event_title)
        emailSent = true
      } catch (emailErr) {
        console.error('Event deferred email error:', emailErr)
      }
    }

    return NextResponse.json({ success: true, emailSent })
  } catch (err) {
    console.error('Event status update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
