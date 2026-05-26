import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/members/setup', request.url))
  }

  try {
    const service = createServiceClient()

    const { data: member } = await service
      .from('members')
      .select('email')
      .eq('id', token)
      .single()

    if (!member?.email) {
      return NextResponse.redirect(new URL('/members/setup', request.url))
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!
    const { data: linkData, error } = await service.auth.admin.generateLink({
      type: 'magiclink',
      email: member.email,
      options: { redirectTo: `${appUrl}/members/setup` },
    })

    if (error || !linkData?.properties?.action_link) {
      console.error('Generate link error:', error)
      return NextResponse.redirect(new URL('/members/setup', request.url))
    }

    return NextResponse.redirect(linkData.properties.action_link)
  } catch (err) {
    console.error('Auth access error:', err)
    return NextResponse.redirect(new URL('/members/setup', request.url))
  }
}
