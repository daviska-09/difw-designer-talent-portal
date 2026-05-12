'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import type { User } from '@supabase/supabase-js'
import type { Member } from '@/lib/types'

const TIER_LABELS: Record<string, string> = {
  emerging_designer: 'Emerging Designer',
  established_designer: 'Established Designer',
  signature_designer: 'Signature Designer',
  curator: 'Curator',
}

export function AccountClient({ user, member }: { user: User; member: Member | null }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const name = member?.full_name ?? user.email

  return (
    <div className="px-8 py-12 max-w-2xl mx-auto">
      <p className="text-xs tracking-[3px] uppercase font-ui font-semibold text-white mb-3">
        Member Area
      </p>
      <h1 className="font-display text-4xl tracking-[3px] uppercase mb-12">Account</h1>

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
