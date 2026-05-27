import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const { data: { users } } = await service.auth.admin.listUsers({ perPage: 1000 })

    const admins = users
      .filter(u => u.user_metadata?.role === 'admin')
      .map(u => ({
        id: u.id,
        email: u.email ?? '',
        full_name: (u.user_metadata?.full_name as string) ?? null,
        created_at: u.created_at,
      }))

    return NextResponse.json({ admins })
  } catch (err) {
    console.error('List admins error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
