import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendMemberWelcome } from '@/lib/resend'
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

    const { data: app, error: appError } = await service
      .from('membership_applications')
      .select('*')
      .eq('id', params.id)
      .single()

    if (appError || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (app.status !== 'approved') {
      return NextResponse.json({ error: 'Application must be approved before activation' }, { status: 400 })
    }

    // Create Supabase auth user (no password — member sets one via magic link)
    const { data: authData, error: authError } = await service.auth.admin.createUser({
      email: app.email,
      email_confirm: true,
      user_metadata: {
        role: 'member',
        full_name: app.full_name,
        brand_name: app.brand_name ?? '',
        membership_tier: app.membership_tier,
      },
    })

    if (authError) {
      if (authError.status === 422) {
        console.log(`User already exists for ${app.email} — skipping duplicate activation`)
        return NextResponse.json({ success: true, skipped: true })
      }
      console.error('Auth user creation error:', authError)
      return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
    }

    const userId = authData.user.id

    await service.from('members').insert({
      id: userId,
      full_name: app.full_name,
      brand_name: app.brand_name,
      email: app.email,
      membership_tier: app.membership_tier,
      membership_application_id: app.id,
    })

    // Update status and Airtable immediately — before email, so these always complete
    await service
      .from('membership_applications')
      .update({ status: 'paid' })
      .eq('id', params.id)

    if (app.airtable_record_id) {
      updateMembershipStatusInAirtable(app.airtable_record_id, 'paid').catch(console.error)
    }

    // Generate magic link and send welcome email — must be awaited so Vercel doesn't kill the function before it completes
    try {
      const { data: linkData, error: linkError } = await service.auth.admin.generateLink({
        type: 'magiclink',
        email: app.email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/members/setup`,
        },
      })
      if (linkError || !linkData?.properties?.action_link) {
        console.error('Magic link generation error:', linkError)
      } else {
        await sendMemberWelcome(app.email, app.full_name, linkData.properties.action_link)
      }
    } catch (emailErr) {
      console.error('Welcome email error:', emailErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Member activation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
