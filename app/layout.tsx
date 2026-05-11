import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dublin Independent Fashion Week',
  description: 'DIFW Member & Talent Portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  )
}
