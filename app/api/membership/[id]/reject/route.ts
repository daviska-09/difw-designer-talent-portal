import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
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

    const service = createServiceClient()

    const { data, error } = await service
      .from('membership_applications')
      .update({ status: 'rejected' })
      .eq('id', params.id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    if (data.airtable_record_id) {
      updateMembershipStatusInAirtable(data.airtable_record_id, 'rejected').catch(console.error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Membership reject error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
