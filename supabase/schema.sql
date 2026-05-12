-- ============================================================
-- DIFW Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Talent applications
create table if not exists talent_applications (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  business_name text,
  email text not null,
  phone text,
  services text[], -- array: ['photographer', 'model', etc.]
  services_other text,
  portfolio_url text,
  supplementary_url text,
  about_me text not null,
  consent boolean not null default false,
  status text not null default 'pending', -- pending | approved | rejected
  airtable_record_id text,
  created_at timestamptz default now()
);

-- Membership applications
create table if not exists membership_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  brand_name text not null,
  location text not null,
  email text not null,
  phone text not null,
  website_url text,
  instagram text,
  membership_tier text not null, -- emerging_designer | established_designer | signature_designer | curator
  emerging_proof_url text,
  about_work text not null,
  why_join text not null,
  difw26_participation text not null, -- yes | no | unsure
  headshot_url text not null,
  logo_url text not null,
  supporting_docs_url text,
  values_agreement boolean not null default false,
  consent_contact boolean not null default false,
  consent_profile_sharing boolean not null default false,
  consent_not_guaranteed boolean not null default false,
  status text not null default 'pending', -- pending | approved | rejected | paid
  airtable_record_id text,
  created_at timestamptz default now()
);

-- ============================================================
-- MIGRATION: Run this if the table already exists from a previous schema
-- ============================================================
-- alter table membership_applications
--   add column if not exists full_name text,
--   add column if not exists location text not null default '',
--   add column if not exists difw26_participation text,
--   add column if not exists headshot_url text,
--   add column if not exists logo_url text,
--   add column if not exists supporting_docs_url text,
--   add column if not exists emerging_proof_url text,
--   add column if not exists values_agreement boolean not null default false,
--   add column if not exists consent_contact boolean not null default false,
--   add column if not exists consent_profile_sharing boolean not null default false,
--   add column if not exists consent_not_guaranteed boolean not null default false;
-- -- Populate full_name from existing split fields if needed:
-- update membership_applications set full_name = first_name || ' ' || last_name where full_name is null;
-- alter table membership_applications alter column full_name set not null;
-- -- Make phone not null (set default for any nulls first):
-- update membership_applications set phone = '' where phone is null;
-- alter table membership_applications alter column phone set not null;

-- Members (activated after payment confirmed)
create table if not exists members (
  id uuid primary key references auth.users(id),
  full_name text,
  brand_name text,
  email text,
  membership_tier text, -- emerging_designer | established_designer | signature_designer | curator
  membership_application_id uuid references membership_applications(id),
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table talent_applications enable row level security;
alter table membership_applications enable row level security;
alter table members enable row level security;

-- Admins: full access (role = 'admin' in raw_user_meta_data)
create policy "Admins can do everything on talent_applications"
  on talent_applications for all
  using (auth.jwt() ->> 'role' = 'admin' or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

create policy "Admins can do everything on membership_applications"
  on membership_applications for all
  using (auth.jwt() ->> 'role' = 'admin' or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

create policy "Admins can do everything on members"
  on members for all
  using (auth.jwt() ->> 'role' = 'admin' or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Members: can read approved talent profiles
create policy "Members can read approved talent applications"
  on talent_applications for select
  using (
    status = 'approved'
    and auth.uid() is not null
  );

-- Members: can read their own member record
create policy "Members can read own member record"
  on members for select
  using (auth.uid() = id);

-- Service role bypass: used by API routes with service key
-- (Supabase service role key bypasses RLS automatically)

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists talent_applications_status_idx on talent_applications(status);
create index if not exists talent_applications_email_idx on talent_applications(email);
create index if not exists membership_applications_status_idx on membership_applications(status);
create index if not exists membership_applications_email_idx on membership_applications(email);
