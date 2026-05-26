import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { syncTalentToAirtable } from '@/lib/airtable'
import { sendTalentConfirmation } from '@/lib/resend'

const BUCKET = 'talent-uploads'

async function uploadFile(
  supabase: ReturnType<typeof createServiceClient>,
  file: File,
  path: string
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const fullPath = `${path}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fullPath, buffer, { contentType: file.type, upsert: false })

  if (error) throw new Error(`Upload failed for ${path}: ${error.message}`)

  return supabase.storage.from(BUCKET).getPublicUrl(fullPath).data.publicUrl
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const full_name = formData.get('full_name') as string
    const business_name = formData.get('business_name') as string
    const location = formData.get('location') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const instagram_website = formData.get('instagram_website') as string
    const services = JSON.parse((formData.get('services') as string) || '[]')
    const services_other = formData.get('services_other') as string
    const portfolio_url = formData.get('portfolio_url') as string
    const about_me = formData.get('about_me') as string
    const consent = formData.get('consent') === 'true'

    const headshotFile = formData.get('headshot') as File | null
    const supplementaryFile = formData.get('supplementary') as File | null

    if (!full_name || !location || !email || !phone || !about_me || !consent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!portfolio_url) {
      return NextResponse.json({ error: 'Portfolio link is required' }, { status: 400 })
    }

    if (!headshotFile || headshotFile.size === 0) {
      return NextResponse.json({ error: 'Headshot is required' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const applicationId = crypto.randomUUID()
    const safeName = full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const folder = `${safeName}-${applicationId.slice(0, 8)}`

    const [headshot_url, supplementary_url] = await Promise.all([
      uploadFile(supabase, headshotFile, `${folder}/headshot`),
      supplementaryFile && supplementaryFile.size > 0 ? uploadFile(supabase, supplementaryFile, `${folder}/supplementary`) : Promise.resolve(null),
    ])

    const { data, error } = await supabase
      .from('talent_applications')
      .insert({
        id: applicationId,
        full_name,
        business_name: business_name || null,
        location,
        email,
        phone: phone || null,
        instagram_website: instagram_website || null,
        services: services || [],
        services_other: services_other || null,
        portfolio_url,
        headshot_url,
        supplementary_url,
        about_me,
        consent,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'An application with this email address already exists.' }, { status: 409 })
      }
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
    }

    // Sync to Airtable (non-blocking)
    syncTalentToAirtable(data).then(async (airtableId) => {
      if (airtableId) {
        await supabase
          .from('talent_applications')
          .update({ airtable_record_id: airtableId })
          .eq('id', data.id)
      }
    })

    // Send confirmation email (non-blocking)
    sendTalentConfirmation(email, full_name).catch(console.error)

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Talent apply error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
