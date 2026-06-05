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

    const { data: rows, error: appError } = await service
      .from('membership_applications')
      .select('*')
      .eq('id', params.id)

    const app = rows?.[0]
    if (appError || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Allow activation from 'approved' (first time) or 'paid' (resend email)
    if (app.status !== 'approved' && app.status !== 'paid') {
      return NextResponse.json({ error: 'Application must be approved before activation' }, { status: 400 })
    }

    if (app.status === 'approved') {
      // First activation — create auth user and member record
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

      if (authError && authError.status !== 422) {
        console.error('Auth user creation error:', authError)
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
      }

      let userId = authData?.user?.id ?? null

      if (!userId && authError?.code === 'email_exists') {
        // User already exists — find their ID
        const { data: { users } } = await service.auth.admin.listUsers()
        userId = users.find(u => u.email === app.email)?.id ?? null
      }

      if (userId) {
        const { data: existing } = await service.from('members').select('id').eq('id', userId).single()
        if (!existing) {
          const { error: memberInsertError } = await service.from('members').insert({
            id: userId,
            full_name: app.full_name,
            brand_name: app.brand_name,
            email: app.email,
            membership_tier: app.membership_tier,
            membership_application_id: app.id,
          })
          if (memberInsertError) console.error('Members insert error:', memberInsertError)
        }
      }

      await service
        .from('membership_applications')
        .update({ status: 'paid' })
        .eq('id', params.id)

      if (app.airtable_record_id) {
        updateMembershipStatusInAirtable(app.airtable_record_id, 'paid').catch(console.error)
      }
    }

    const { data: memberRecord } = await service
      .from('members')
      .select('id')
      .eq('email', app.email)
      .single()

    let emailSent = false
    let emailError: string | undefined
    if (memberRecord?.id) {
      try {
        const emailResult = await sendMemberWelcome(app.email, app.full_name, memberRecord.id)
        console.log('Resend welcome result:', JSON.stringify(emailResult))
        emailSent = true
      } catch (emailErr) {
        console.error('Resend welcome error:', emailErr)
        emailError = String(emailErr)
      }
    } else {
      emailError = 'Member record not found'
      console.error('sendMemberWelcome skipped:', emailError)
    }

    return NextResponse.json({ success: true, emailSent, ...(emailError ? { emailError } : {}) })
  } catch (err) {
    console.error('Member activation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
