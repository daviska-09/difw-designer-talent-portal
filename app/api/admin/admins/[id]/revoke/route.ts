import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.id === params.id) {
      return NextResponse.json({ error: 'You cannot revoke your own admin access' }, { status: 400 })
    }

    const service = createServiceClient()
    const { error } = await service.auth.admin.updateUserById(params.id, {
      user_metadata: { role: null },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Revoke admin error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
