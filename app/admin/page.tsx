export const metadata = { title: 'Admin — DIFW' }

export default function AdminHomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <img
        src="/logo.webp"
        alt="Dublin Independent Fashion Week"
        className="w-48 mb-10"
      />
      <h1 className="font-display text-5xl tracking-[6px] uppercase text-white">
        Admin Panel
      </h1>
    </div>
  )
}
