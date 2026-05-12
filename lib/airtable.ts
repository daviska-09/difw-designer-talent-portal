import Airtable from 'airtable'
import type { TalentApplication, MembershipApplication } from './types'

const TALENT_TABLE = 'Talent Submissions'
const MEMBERSHIP_TABLE = 'Membership Applications'

function getBase() {
  return new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID!
  )
}

export async function syncTalentToAirtable(app: TalentApplication): Promise<string | null> {
  try {
    const record = await getBase()(TALENT_TABLE).create({
      'First Name': app.first_name,
      'Last Name': app.last_name,
      'Business Name': app.business_name ?? '',
      'Email': app.email,
      'Phone': app.phone ?? '',
      'Services': (app.services ?? []).join(', '),
      'Services Other': app.services_other ?? '',
      'Portfolio URL': app.portfolio_url ?? '',
      'Supplementary URL': app.supplementary_url ?? '',
      'About Me': app.about_me,
      'Status': app.status,
      'Supabase ID': app.id,
    })
    return record.id
  } catch (err) {
    console.error('Airtable sync failed (talent):', err)
    return null
  }
}

export async function updateTalentStatusInAirtable(
  airtableRecordId: string,
  status: string
): Promise<void> {
  try {
    await getBase()(TALENT_TABLE).update(airtableRecordId, { Status: status })
  } catch (err) {
    console.error('Airtable status update failed (talent):', err)
  }
}

export async function syncMembershipToAirtable(
  app: MembershipApplication
): Promise<string | null> {
  try {
    const record = await getBase()(MEMBERSHIP_TABLE).create({
      'Full Name': app.full_name,
      'Brand Name': app.brand_name,
      'Location': app.location,
      'Email': app.email,
      'Phone': app.phone,
      'Website URL': app.website_url ?? '',
      'Instagram': app.instagram ?? '',
      'Membership Tier': app.membership_tier,
      'About Work': app.about_work,
      'Why Join': app.why_join,
      'DIFW26 Participation': app.difw26_participation,
      'Headshot URL': app.headshot_url,
      'Logo URL': app.logo_url,
      'Supporting Docs URL': app.supporting_docs_url ?? '',
      'Emerging Proof URL': app.emerging_proof_url ?? '',
      'Status': app.status,
      'Supabase ID': app.id,
    })
    return record.id
  } catch (err) {
    console.error('Airtable sync failed (membership):', err)
    return null
  }
}

export async function updateMembershipStatusInAirtable(
  airtableRecordId: string,
  status: string
): Promise<void> {
  try {
    await getBase()(MEMBERSHIP_TABLE).update(airtableRecordId, { Status: status })
  } catch (err) {
    console.error('Airtable status update failed (membership):', err)
  }
}

export async function updateMembershipRecord(
  airtableRecordId: string,
  fields: Record<string, string | number | boolean>
): Promise<void> {
  try {
    await getBase()(MEMBERSHIP_TABLE).update(airtableRecordId, fields)
  } catch (err) {
    console.error('Airtable record update failed (membership):', err)
  }
}
