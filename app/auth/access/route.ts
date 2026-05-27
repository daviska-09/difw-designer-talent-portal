import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/members/setup?error=invalid', request.url))
  }

  try {
    const service = createServiceClient()

    const { data: member } = await service
      .from('members')
      .select('email')
      .eq('id', token)
      .single()

    if (!member?.email) {
      return NextResponse.redirect(new URL('/members/setup?error=invalid', request.url))
    }

    // Block if a different user is already logged in
    const supabase = createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser && currentUser.email !== member.email) {
      return NextResponse.redirect(new URL('/members/setup?error=wrong-account', request.url))
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!
    const { data: linkData, error } = await service.auth.admin.generateLink({
      type: 'magiclink',
      email: member.email,
      options: { redirectTo: `${appUrl}/members/setup` },
    })

    if (error || !linkData?.properties?.hashed_token) {
      console.error('Generate link error:', error)
      return NextResponse.redirect(new URL('/members/setup?error=invalid', request.url))
    }

    // Route through /auth/confirm so the SSR client sets the session cookie properly
    const confirmUrl = new URL('/auth/confirm', request.url)
    confirmUrl.searchParams.set('token_hash', linkData.properties.hashed_token)
    confirmUrl.searchParams.set('type', 'magiclink')
    confirmUrl.searchParams.set('next', '/members/setup')

    return NextResponse.redirect(confirmUrl)
  } catch (err) {
    console.error('Auth access error:', err)
    return NextResponse.redirect(new URL('/members/setup?error=invalid', request.url))
  }
}
