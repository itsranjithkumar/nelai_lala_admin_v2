import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nelai Admin',
  description: 'Restaurant Management Admin Panel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-background">
          <div className="container py-10">
            <h1 className="text-3xl font-bold mb-8">Restaurant Admin</h1>
            {children}
          </div>
          <Toaster />
        </div>
      </body>
    </html>
  )
}
