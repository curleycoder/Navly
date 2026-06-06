import type { Metadata } from 'next'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { AuthGuard } from '@/components/dashboard/AuthGuard'

// Dashboard pages are behind auth — prevent search engine indexing
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

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
          <main id="main-content" className="flex-1 overflow-y-auto pb-16 md:pb-0" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
      <BottomNav />
    </AuthGuard>
  )
}
