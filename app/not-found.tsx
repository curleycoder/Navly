import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { NavlyLogo } from '@/components/ui/NavlyLogo'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-6 text-center">
      <NavlyLogo size="sm" />

      <p className="mt-10 text-8xl font-bold text-[#0B1F3A]">404</p>
      <h1 className="mt-4 text-2xl font-bold text-[#0B1F3A]">Page not found</h1>
      <p className="mt-3 max-w-sm text-slate-500">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard"
          className={buttonVariants({ className: 'bg-[#D62828] text-white hover:bg-[#B91C1C]' })}
        >
          Go to dashboard
        </Link>
        <Link
          href="/"
          className={buttonVariants({ variant: 'outline', className: 'gap-2 border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white' })}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </main>
  )
}
