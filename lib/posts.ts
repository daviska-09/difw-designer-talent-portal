// Server-side post data functions (use only in Server Components and API routes)
//
// Required Supabase table:
//
//   CREATE TABLE posts (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     headline VARCHAR(120) NOT NULL,
//     body_text TEXT NOT NULL,
//     feature_photo_url VARCHAR(255),
//     hyperlink VARCHAR(255),
//     published_at TIMESTAMPTZ DEFAULT NOW(),
//     created_at TIMESTAMPTZ DEFAULT NOW(),
//     updated_at TIMESTAMPTZ DEFAULT NOW(),
//     is_published BOOLEAN DEFAULT TRUE,
//     admin_id UUID REFERENCES auth.users(id),
//     airtable_record_id VARCHAR(50)
//   );
//
//   ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "Public read published" ON posts FOR SELECT USING (is_published = true);
//
//   -- Storage bucket: post-images (public)

import { createServiceClient } from '@/lib/supabase/server'
import type { Post } from './types'

const PER_PAGE = 10

export async function getPublishedPosts(
  page = 1
): Promise<{ posts: Post[]; total: number }> {
  const supabase = createServiceClient()
  const from = (page - 1) * PER_PAGE
  const to = from + PER_PAGE - 1

  const { data, error, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return { posts: data ?? [], total: count ?? 0 }
}

export async function getAllPosts(
  page = 1
): Promise<{ posts: Post[]; total: number }> {
  const supabase = createServiceClient()
  const from = (page - 1) * PER_PAGE
  const to = from + PER_PAGE - 1

  const { data, error, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return { posts: data ?? [], total: count ?? 0 }
}
