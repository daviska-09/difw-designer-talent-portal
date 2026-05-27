import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendAdminPasswordReset } from '@/lib/resend'

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

    const service = createServiceClient()
    const { data: { user: target }, error: getUserError } = await service.auth.admin.getUserById(params.id)

    if (getUserError || !target?.email) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    const { data: linkData, error } = await service.auth.admin.generateLink({
      type: 'recovery',
      email: target.email,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password` },
    })

    if (error || !linkData?.properties?.hashed_token) {
      return NextResponse.json({ error: 'Failed to generate reset link' }, { status: 500 })
    }

    const confirmUrl = new URL('/auth/confirm', process.env.NEXT_PUBLIC_APP_URL!)
    confirmUrl.searchParams.set('token_hash', linkData.properties.hashed_token)
    confirmUrl.searchParams.set('type', 'recovery')

    await sendAdminPasswordReset(target.email, confirmUrl.toString())

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin reset password error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
