import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { AuthGuard } from '@/components/dashboard/AuthGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen flex-col overflow-hidden bg-[#F8FAFC] md:flex-row">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <MobileNav />
          <main id="main-content" className="flex-1 overflow-y-auto" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
