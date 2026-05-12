import { MemberNav } from '@/components/members/MemberNav'

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black">
      <MemberNav />
      <main>{children}</main>
    </div>
  )
}
