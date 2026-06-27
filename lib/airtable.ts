import Airtable from 'airtable'
import type { TalentApplication, MembershipApplication, Post, EventSubmission } from './types'

const TALENT_TABLE = 'Talent Submissions'
const MEMBERSHIP_TABLE = 'Membership Applications'
const POSTS_TABLE = 'Announcements'
const EVENTS_TABLE = 'Event Submissions'

function getBase() {
  return new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID!
  )
}

export async function syncTalentToAirtable(app: TalentApplication): Promise<string | null> {
  try {
    const record = await getBase()(TALENT_TABLE).create({
      'Full Name': app.full_name,
      'Business Name': app.business_name ?? '',
      'Location': app.location,
      'Email': app.email,
      'Phone': app.phone ?? '',
      'Instagram / Website': app.instagram_website ?? '',
      'Services': (app.services ?? []).join(', '),
      'Services Other': app.services_other ?? '',
      'Portfolio URL': app.portfolio_url ?? '',
      'Headshot URL': app.headshot_url ?? '',
      'Supplementary URL': app.supplementary_url ?? '',
      'About Me': app.about_me,
      'Consent': app.consent,
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
      'Headshot URL': app.headshot_url ?? '',
      'Logo URL': app.logo_url,
      'Supporting Docs URL': app.supporting_docs_url ?? '',
      'Emerging Proof URL': app.emerging_proof_url ?? '',
      'Values Agreement': app.values_agreement,
      'Consent Contact': app.consent_contact,
      'Consent Profile Sharing': app.consent_profile_sharing,
      'Consent Not Guaranteed': app.consent_not_guaranteed,
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

export async function syncPostToAirtable(post: Post): Promise<string | null> {
  try {
    const record = await getBase()(POSTS_TABLE).create({
      'Headline': post.headline,
      'Body': post.body_text,
      'Photo URL': post.feature_photo_url ?? '',
      'Link': post.hyperlink ?? '',
      'Published Date': post.published_at,
      'Status': post.is_published ? 'Published' : 'Draft',
      'Supabase ID': post.id,
    })
    return record.id
  } catch (err) {
    console.error('Airtable sync failed (post):', err)
    return null
  }
}

export async function updatePostInAirtable(
  airtableRecordId: string,
  fields: Record<string, string | boolean>
): Promise<void> {
  try {
    await getBase()(POSTS_TABLE).update(airtableRecordId, fields)
  } catch (err) {
    console.error('Airtable post update failed:', err)
  }
}

export async function deletePostFromAirtable(airtableRecordId: string): Promise<void> {
  try {
    await getBase()(POSTS_TABLE).destroy(airtableRecordId)
  } catch (err) {
    console.error('Airtable post delete failed:', err)
  }
}

export async function syncEventToAirtable(sub: EventSubmission): Promise<string | null> {
  try {
    const record = await getBase()(EVENTS_TABLE).create({
      'Lead Applicant Name': sub.lead_applicant_name,
      'Email': sub.email,
      'Phone': sub.phone,
      'Brand / Organisation': sub.brand_name,
      'Website': sub.website ?? '',
      'Social Links': sub.social_links ?? '',
      'Practice Description': sub.practice_description ?? '',
      'Work Category': sub.work_category ?? '',
      'Work Category Other': sub.work_category_other ?? '',
      'Event Title': sub.event_title,
      'Event Type': sub.event_type,
      'Event Type Other': sub.event_type_other ?? '',
      'Collaboration': sub.event_collaboration,
      'Collaborators': sub.collaborators ?? '',
      'Open to Alternatives': sub.open_to_alternatives ?? '',
      'Public Description': sub.event_description ?? '',
      'Event Access': sub.event_access ?? '',
      'Intended Audience': sub.intended_audience ?? '',
      'Estimated Attendees': sub.estimated_attendees ?? '',
      'Event Concept': sub.event_concept ?? '',
      'Why DIFW26': sub.why_difw26 ?? '',
      'Supporting Materials URL': sub.supporting_materials_url ?? '',
      'Venue Secured': sub.venue_secured ?? '',
      'Venue Details': sub.venue_details ?? '',
      'Venue Preference': sub.venue_preference ?? '',
      'Preferred Dates': (sub.preferred_dates ?? []).join(', '),
      'Preferred Time': sub.preferred_time ?? '',
      'Event Duration': sub.event_duration ?? '',
      'Technical Requirements': sub.technical_requirements ?? '',
      'Additional Info': sub.additional_info ?? '',
      'Status': sub.status,
      'Supabase ID': sub.id,
    })
    return record.id
  } catch (err) {
    console.error('Airtable sync failed (event):', err)
    return null
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
