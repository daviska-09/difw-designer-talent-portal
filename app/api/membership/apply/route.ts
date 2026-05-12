import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { syncMembershipToAirtable } from '@/lib/airtable'
import { sendMembershipConfirmation } from '@/lib/resend'

const BUCKET = 'membership-uploads'

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
    const brand_name = formData.get('brand_name') as string
    const location = formData.get('location') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const instagram = formData.get('instagram') as string
    const website_url = formData.get('website_url') as string
    const membership_tier = formData.get('membership_tier') as string
    const about_work = formData.get('about_work') as string
    const why_join = formData.get('why_join') as string
    const difw26_participation = formData.get('difw26_participation') as string
    const values_agreement = formData.get('values_agreement') === 'true'
    const consent_contact = formData.get('consent_contact') === 'true'
    const consent_profile_sharing = formData.get('consent_profile_sharing') === 'true'
    const consent_not_guaranteed = formData.get('consent_not_guaranteed') === 'true'

    const headshotFile = formData.get('headshot') as File | null
    const logoFile = formData.get('logo') as File | null
    const supportingDocsFile = formData.get('supporting_docs') as File | null
    const emergingProofFile = formData.get('emerging_proof') as File | null

    if (
      !full_name || !brand_name || !location || !email || !phone ||
      !membership_tier || !about_work || !why_join || !difw26_participation ||
      !values_agreement || !consent_contact || !consent_profile_sharing || !consent_not_guaranteed
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!headshotFile || headshotFile.size === 0) {
      return NextResponse.json({ error: 'Headshot is required' }, { status: 400 })
    }
    if (!logoFile || logoFile.size === 0) {
      return NextResponse.json({ error: 'Logo is required' }, { status: 400 })
    }
    if (membership_tier === 'emerging_designer' && (!emergingProofFile || emergingProofFile.size === 0)) {
      return NextResponse.json({ error: 'Proof of eligibility is required for Emerging Designer' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const applicationId = crypto.randomUUID()
    const safeName = full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const folder = `${safeName}-${applicationId.slice(0, 8)}`

    const headshot_url = await uploadFile(supabase, headshotFile, `${folder}/headshot`)
    const logo_url = await uploadFile(supabase, logoFile, `${folder}/logo`)

    const supporting_docs_url = supportingDocsFile && supportingDocsFile.size > 0
      ? await uploadFile(supabase, supportingDocsFile, `${folder}/supporting_docs`)
      : null

    const emerging_proof_url = emergingProofFile && emergingProofFile.size > 0
      ? await uploadFile(supabase, emergingProofFile, `${folder}/emerging_proof`)
      : null

    const { data, error } = await supabase
      .from('membership_applications')
      .insert({
        id: applicationId,
        full_name,
        brand_name,
        location,
        email,
        phone,
        instagram: instagram || null,
        website_url: website_url || null,
        membership_tier,
        about_work,
        why_join,
        difw26_participation,
        headshot_url,
        logo_url,
        supporting_docs_url,
        emerging_proof_url,
        values_agreement,
        consent_contact,
        consent_profile_sharing,
        consent_not_guaranteed,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
    }

    // Sync to Airtable (non-blocking, fails silently)
    syncMembershipToAirtable(data).then(async (airtableId) => {
      if (airtableId) {
        await supabase
          .from('membership_applications')
          .update({ airtable_record_id: airtableId })
          .eq('id', data.id)
      }
    })

    // Send confirmation email (non-blocking)
    sendMembershipConfirmation(email, full_name).catch(console.error)

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Membership apply error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
