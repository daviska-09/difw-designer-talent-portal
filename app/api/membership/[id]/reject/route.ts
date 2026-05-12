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

    const { data: rows, error } = await service
      .from('membership_applications')
      .select('airtable_record_id')
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    await service
      .from('membership_applications')
      .update({ status: 'rejected' })
      .eq('id', params.id)

    const airtableId = rows?.[0]?.airtable_record_id
    if (airtableId) {
      updateMembershipStatusInAirtable(airtableId, 'rejected').catch(console.error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Membership reject error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
