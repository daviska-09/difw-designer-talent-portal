import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendAdminPasswordReset } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const service = createServiceClient()

    const { data: { users } } = await service.auth.admin.listUsers({ perPage: 1000 })
    const user = users.find(u => u.email === email)

    // Silently succeed if not found or not an admin
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ success: true })
    }

    const { data: linkData, error } = await service.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password` },
    })

    if (error || !linkData?.properties?.hashed_token) {
      console.error('Generate reset link error:', error)
      return NextResponse.json({ error: 'Failed to generate reset link' }, { status: 500 })
    }

    const confirmUrl = new URL('/auth/confirm', process.env.NEXT_PUBLIC_APP_URL!)
    confirmUrl.searchParams.set('token_hash', linkData.properties.hashed_token)
    confirmUrl.searchParams.set('type', 'recovery')

    await sendAdminPasswordReset(email, confirmUrl.toString())

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin forgot password error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
