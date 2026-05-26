import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendAccessLink } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const service = createServiceClient()

    const { data: member } = await service
      .from('members')
      .select('full_name')
      .eq('email', email)
      .single()

    // Silently succeed if not found — don't reveal whether email is registered
    if (!member) return NextResponse.json({ success: true })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!
    const { data: linkData, error: linkError } = await service.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${appUrl}/members/setup` },
    })

    if (linkError || !linkData?.properties?.action_link) {
      console.error('Generate link error:', linkError)
      return NextResponse.json({ error: 'Failed to generate sign-in link' }, { status: 500 })
    }

    await sendAccessLink(email, member.full_name ?? email, linkData.properties.action_link)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Send access link error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
