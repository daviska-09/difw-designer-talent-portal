'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import type { User } from '@supabase/supabase-js'
import type { Member } from '@/lib/types'

const TIER_LABELS: Record<string, string> = {
  emerging_designer: 'Emerging Designer',
  established_designer: 'Established Designer',
  signature_designer: 'Signature Designer',
  producer: 'Producer',
}

export function AccountClient({ user, member, headshotUrl }: { user: User; member: Member | null; headshotUrl: string | null }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(headshotUrl)
  const [uploading, setUploading] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('photo', file)

    const res = await fetch('/api/members/profile-photo', { method: 'POST', body: formData })
    const data = await res.json()

    if (data.url) setPhotoUrl(data.url)
    setUploading(false)
    e.target.value = ''
  }

  const name = member?.full_name ?? user.email

  return (
    <div className="px-8 py-12 max-w-2xl mx-auto">
      <p className="text-xs tracking-[3px] uppercase font-ui font-semibold text-white mb-3">
        DIFW Portal
      </p>
      <h1 className="font-display text-4xl tracking-[3px] uppercase mb-12">Account</h1>

      <div className="mb-12">
        <div className="relative w-32 h-32">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-[#1a1a1a]">
            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt={member?.full_name ?? 'Profile photo'}
                className="w-full h-full object-cover object-top"
              />
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-[#e5e5e5] transition-colors disabled:opacity-50"
            aria-label="Change profile photo"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z" stroke="#000" strokeWidth="1.2" strokeLinejoin="round"/>
              <path d="M7.5 3.5L10.5 6.5" stroke="#000" strokeWidth="1.2"/>
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
      </div>

      <div className="border-t border-[#1a1a1a] pt-8 space-y-8">
        <div>
          <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white mb-1">
            Name
          </p>
          <p className="text-white">{name}</p>
        </div>

        {member?.brand_name && (
          <div>
            <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white mb-1">
              Brand
            </p>
            <p className="text-white">{member.brand_name}</p>
          </div>
        )}

        <div>
          <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white mb-1">
            Email
          </p>
          <p className="text-white">{member?.email ?? user.email}</p>
        </div>

        {member?.membership_tier && (
          <div>
            <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white mb-1">
              Membership
            </p>
            <p className="text-white">{TIER_LABELS[member.membership_tier] ?? member.membership_tier}</p>
          </div>
        )}

        <div className="border-t border-[#1a1a1a] pt-8">
          <Button variant="outline" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </div>
    </div>
  )
}
