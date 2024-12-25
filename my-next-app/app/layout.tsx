import { Toaster } from "@/components/ui/toaster"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Restaurant Admin</h1>
        {children}
      </div>
      <Toaster />
    </div>
  )
}

