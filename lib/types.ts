export type TalentStatus = 'pending' | 'approved' | 'rejected'
export type MembershipStatus = 'pending' | 'approved' | 'rejected' | 'paid'
export type MembershipTier = 'emerging_designer' | 'established_designer' | 'signature_designer' | 'producer'
export type DIFW26Participation = 'yes' | 'no' | 'unsure'

export type ServiceType =
  | 'model'
  | 'photographer'
  | 'videographer'
  | 'content_creator'
  | 'stylist'
  | 'hair_stylist'
  | 'mua'
  | 'production_crew'
  | 'general_volunteer'
  | 'lighting_technician'
  | 'sound_technician'
  | 'dj_musician'
  | 'performer'
  | 'other'

export interface TalentApplication {
  id: string
  full_name: string
  business_name: string | null
  location: string
  email: string
  phone: string | null
  instagram_website: string | null
  services: ServiceType[]
  services_other: string | null
  portfolio_url: string | null
  headshot_url: string
  supplementary_url: string | null
  about_me: string
  consent: boolean
  status: TalentStatus
  airtable_record_id: string | null
  created_at: string
  deleted_at: string | null
}

export interface MembershipApplication {
  id: string
  full_name: string
  brand_name: string
  location: string
  email: string
  phone: string
  website_url: string | null
  instagram: string | null
  membership_tier: MembershipTier
  emerging_proof_url: string | null
  about_work: string
  why_join: string
  difw26_participation: DIFW26Participation
  headshot_url: string | null
  logo_url: string
  supporting_docs_url: string | null
  values_agreement: boolean
  consent_contact: boolean
  consent_profile_sharing: boolean
  consent_not_guaranteed: boolean
  status: MembershipStatus
  airtable_record_id: string | null
  created_at: string
  deleted_at: string | null
}

export interface Post {
  id: string
  headline: string
  body_text: string
  feature_photo_url: string | null
  hyperlink: string | null
  published_at: string
  created_at: string
  updated_at: string
  is_published: boolean
  admin_id: string | null
  airtable_record_id: string | null
}

export type EventSubmissionStatus = 'pending' | 'accepted' | 'deferred' | 'rejected'

export interface EventSubmission {
  id: string
  created_at: string
  lead_applicant_name: string
  email: string
  phone: string
  brand_name: string
  website: string | null
  social_links: string | null
  practice_description: string | null
  work_category: string | null
  work_category_other: string | null
  event_title: string
  event_type: string
  event_type_other: string | null
  event_collaboration: string
  collaborators: string | null
  open_to_alternatives: string | null
  event_description: string | null
  event_access: string | null
  intended_audience: string | null
  estimated_attendees: string | null
  event_concept: string | null
  why_difw26: string | null
  supporting_materials_url: string | null
  venue_secured: string | null
  venue_details: string | null
  venue_preference: string | null
  preferred_dates: string[]
  preferred_time: string | null
  event_duration: string | null
  technical_requirements: string | null
  confirm_accurate: boolean
  confirm_not_guaranteed: boolean
  confirm_deadline: boolean
  additional_info: string | null
  status: EventSubmissionStatus
  airtable_record_id: string | null
}

export interface Member {
  id: string
  full_name: string | null
  brand_name: string | null
  email: string | null
  membership_tier: MembershipTier | null
  membership_application_id: string | null
  profile_photo_url: string | null
  created_at: string
}
