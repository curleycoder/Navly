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
import { useLocale } from '@/lib/i18n'

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLocale()

  const PAGE_TITLES: Record<string, string> = {
    '/dashboard': t('nav.home'),
    '/dashboard/pr-tracker': t('nav.prTracker'),
    '/dashboard/days': t('nav.daysInCanada'),
    '/dashboard/tasks': t('nav.tasks'),
    '/dashboard/news': t('nav.immigrationNews'),
    '/dashboard/chat': t('nav.aiAssistant'),
    '/dashboard/consultants': t('nav.consultant'),
    '/dashboard/profile': t('nav.myProfile'),
  }

  const pageTitle = PAGE_TITLES[pathname] ?? t('nav.dashboard')
  const isHome = pathname === '/dashboard'

  return (
    <header className="flex h-14 items-center border-b border-subtle bg-surface-card px-3 md:hidden">
      {/* Left: 3-dots menu (home) or back button (sub-pages) */}
      <div className="flex w-10 shrink-0 items-center justify-start">
        {isHome ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-text transition hover:bg-subtle active:bg-subtle"
              aria-label="More options"
            >
              <MoreHorizontal className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-44">
              <DropdownMenuItem render={<Link href="/help" />}>
                <HelpCircle className="h-4 w-4" />
                {t('nav.helpCenter')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/privacy" />}>
                <Shield className="h-4 w-4" />
                {t('nav.privacyPolicy')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/terms" />}>
                <FileText className="h-4 w-4" />
                {t('nav.termsOfService')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                <Gift className="h-4 w-4" />
                {t('nav.referFriend')}
                <span className="ml-auto text-[10px] font-semibold text-muted-text/70">{t('common.comingSoon')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-text transition hover:bg-subtle active:bg-subtle"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Center: page title */}
      <div className="flex flex-1 items-center justify-center px-2">
        <span className="truncate text-sm font-bold text-heading">{pageTitle}</span>
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
