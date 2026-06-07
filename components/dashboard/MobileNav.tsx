'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronLeft, MoreHorizontal, HelpCircle, Shield, Gift, FileText } from 'lucide-react'
import { NavlyLogo } from '@/components/ui/NavlyLogo'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Home',
  '/dashboard/pr-tracker': 'Tracker',
  '/dashboard/days': 'Days in Canada',
  '/dashboard/tasks': 'Tasks',
  '/dashboard/news': 'Immigration News',
  '/dashboard/chat': 'AI Assistant',
  '/dashboard/consultants': 'Consultant',
  '/dashboard/profile': 'My Profile',
}

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()

  const pageTitle = PAGE_TITLES[pathname] ?? 'Dashboard'
  const isHome = pathname === '/dashboard'

  return (
    <header className="flex h-14 items-center border-b border-slate-200 bg-white px-3 md:hidden">
      {/* Left: 3-dots menu (home) or back button (sub-pages) */}
      <div className="flex w-10 shrink-0 items-center justify-start">
        {isHome ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 active:bg-slate-200"
              aria-label="More options"
            >
              <MoreHorizontal className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-44">
              <DropdownMenuItem render={<Link href="/help" />}>
                <HelpCircle className="h-4 w-4" />
                Help Center
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/privacy" />}>
                <Shield className="h-4 w-4" />
                Privacy Policy
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/terms" />}>
                <FileText className="h-4 w-4" />
                Terms of Service
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                <Gift className="h-4 w-4" />
                Refer a Friend
                <span className="ml-auto text-[10px] font-semibold text-slate-400">Soon</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 active:bg-slate-200"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Center: page title */}
      <div className="flex flex-1 items-center justify-center px-2">
        <span className="truncate text-sm font-bold text-[#0B1F3A]">{pageTitle}</span>
      </div>

      {/* Right: Navly logo */}
      <div className="flex w-10 shrink-0 items-center justify-end">
        <Link href="/dashboard" aria-label="Dashboard home">
          <div className="pt-2 px-1">
            <NavlyLogo size="sm" showWordmark={false} />
          </div>
        </Link>
      </div>
    </header>
  )
}
