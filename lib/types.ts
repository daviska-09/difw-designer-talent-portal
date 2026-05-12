export type TalentStatus = 'pending' | 'approved' | 'rejected'
export type MembershipStatus = 'pending' | 'approved' | 'rejected' | 'paid'
export type MembershipTier = 'emerging_designer' | 'established_designer' | 'signature_designer' | 'curator'
export type DIFW26Participation = 'yes' | 'no' | 'unsure'

export type ServiceType =
  | 'photographer'
  | 'videographer'
  | 'model'
  | 'stylist'
  | 'mua'
  | 'other'

export interface TalentApplication {
  id: string
  first_name: string
  last_name: string
  business_name: string | null
  email: string
  phone: string | null
  services: ServiceType[]
  services_other: string | null
  portfolio_url: string | null
  supplementary_url: string | null
  about_me: string
  consent: boolean
  status: TalentStatus
  airtable_record_id: string | null
  created_at: string
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
  headshot_url: string
  logo_url: string
  supporting_docs_url: string | null
  values_agreement: boolean
  consent_contact: boolean
  consent_profile_sharing: boolean
  consent_not_guaranteed: boolean
  status: MembershipStatus
  airtable_record_id: string | null
  created_at: string
}

export interface Member {
  id: string
  full_name: string | null
  brand_name: string | null
  email: string | null
  membership_tier: MembershipTier | null
  membership_application_id: string | null
  created_at: string
}
