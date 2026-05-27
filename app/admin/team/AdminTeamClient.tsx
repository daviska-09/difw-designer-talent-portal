'use client'

import { useState } from 'react'

type Admin = {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

export function AdminTeamClient({ admins: initial, currentUserId }: { admins: Admin[]; currentUserId: string }) {
  const [admins, setAdmins] = useState(initial)
  const [resetSent, setResetSent] = useState<Record<string, boolean>>({})
  const [loadingAction, setLoadingAction] = useState<Record<string, string | null>>({})

  async function handleResetPassword(id: string) {
    setLoadingAction(prev => ({ ...prev, [id]: 'reset' }))
    const res = await fetch(`/api/admin/admins/${id}/reset-password`, { method: 'POST' })
    setLoadingAction(prev => ({ ...prev, [id]: null }))
    if (res.ok) setResetSent(prev => ({ ...prev, [id]: true }))
  }

  async function handleRevoke(id: string) {
    if (!confirm('Revoke admin access for this user? They will immediately lose access to the admin panel.')) return
    setLoadingAction(prev => ({ ...prev, [id]: 'revoke' }))
    const res = await fetch(`/api/admin/admins/${id}/revoke`, { method: 'POST' })
    setLoadingAction(prev => ({ ...prev, [id]: null }))
    if (res.ok) setAdmins(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="px-8 py-12">
      <p className="text-xs tracking-[3px] uppercase font-ui font-semibold text-white/40 mb-2">Admin</p>
      <h1 className="font-display text-4xl tracking-[3px] uppercase mb-12">Team</h1>

      <div className="border-t border-[#1a1a1a]">
        {admins.map(admin => (
          <div key={admin.id} className="flex items-center justify-between py-5 border-b border-[#1a1a1a]">
            <div className="flex gap-12">
              <div>
                <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white/40 mb-1">Name</p>
                <p className="text-white text-sm">{admin.full_name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white/40 mb-1">Email</p>
                <p className="text-white text-sm">{admin.email}</p>
              </div>
              <div>
                <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white/40 mb-1">Added</p>
                <p className="text-white text-sm">
                  {new Date(admin.created_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {resetSent[admin.id] ? (
                <span className="text-xs tracking-[2px] uppercase font-ui text-white/40">Reset email sent</span>
              ) : (
                <button
                  onClick={() => handleResetPassword(admin.id)}
                  disabled={loadingAction[admin.id] === 'reset'}
                  className="text-xs tracking-[2px] uppercase font-ui text-white hover:text-white/60 transition-colors disabled:opacity-40"
                >
                  {loadingAction[admin.id] === 'reset' ? 'Sending...' : 'Reset Password'}
                </button>
              )}
              {admin.id !== currentUserId && (
                <button
                  onClick={() => handleRevoke(admin.id)}
                  disabled={loadingAction[admin.id] === 'revoke'}
                  className="text-xs tracking-[2px] uppercase font-ui text-[#CC0000] hover:text-red-400 transition-colors disabled:opacity-40"
                >
                  {loadingAction[admin.id] === 'revoke' ? 'Revoking...' : 'Revoke Access'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
