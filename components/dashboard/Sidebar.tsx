'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  CalendarDays,
  MapPin,
  ListChecks,
  MessageSquare,
  UserCircle,
  LogOut,
  TrendingUp,
  FileText,
} from 'lucide-react'
import { NavlyLogo } from '@/components/ui/NavlyLogo'
import { cn } from '@/lib/utils'
import { loadProfile } from '@/lib/profile'
import { supabase } from '@/lib/supabase/client'
import { useLocale } from '@/lib/i18n'

const NAV_HREFS = [
  { href: '/dashboard',       key: 'home'  as const, icon: LayoutDashboard, outsideOk: true },
  { href: '/dashboard/dates', key: 'dates' as const, icon: CalendarDays,    outsideOk: true },
  { href: '/dashboard/days',  key: 'travel' as const, icon: MapPin,         outsideOk: false },
  { href: '/dashboard/tasks', key: 'tasks' as const, icon: ListChecks,      outsideOk: true },
  { href: '/dashboard/chat',  key: 'ask'   as const, icon: MessageSquare,   outsideOk: true },
]

// Keep this export for MobileNav
export const navItems = NAV_HREFS

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLocale()
  const [isOutside, setIsOutside] = useState(false)
  useEffect(() => {
    const profile = loadProfile()
    setIsOutside(profile?.locationStatus === 'outside')
  }, [])

  const visibleItems = NAV_HREFS.filter((item) => !isOutside || item.outsideOk)

  return (
    <aside className="hidden h-full w-60 flex-col border-r border-subtle bg-surface-card md:flex">
      <div className="flex h-16 items-center border-b border-subtle px-5">
        <Link href="/">
          <NavlyLogo size="sm" />
        </Link>
      </div>

      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 p-3">
        {visibleItems.map(({ href, key, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                active
                  ? 'bg-navly-navy text-white'
                  : 'text-muted-text hover:bg-subtle hover:text-heading'
              )}
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              {t(`nav.${key}`)}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-subtle p-3">
        <Link
          href="/dashboard/profile"
          aria-current={pathname === '/dashboard/profile' ? 'page' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
            pathname === '/dashboard/profile'
              ? 'bg-navly-navy text-white'
              : 'text-muted-text hover:bg-subtle hover:text-heading'
          )}
        >
          <UserCircle className="h-4 w-4 shrink-0" />
          {t('nav.myProfile')}
        </Link>
        <Link
          href="/dashboard/pr-tracker"
          aria-current={pathname === '/dashboard/pr-tracker' ? 'page' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
            pathname === '/dashboard/pr-tracker'
              ? 'bg-navly-navy text-white'
              : 'text-muted-text hover:bg-subtle hover:text-heading'
          )}
        >
          <TrendingUp className="h-4 w-4 shrink-0" />
          {t('nav.prTracker')}
        </Link>
        <Link
          href="/dashboard/report"
          aria-current={pathname === '/dashboard/report' ? 'page' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
            pathname === '/dashboard/report'
              ? 'bg-navly-navy text-white'
              : 'text-muted-text hover:bg-subtle hover:text-heading'
          )}
        >
          <FileText className="h-4 w-4 shrink-0" />
          Readiness Report
        </Link>
        <div className="my-2 border-t border-subtle/60" />
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            localStorage.clear()
            window.location.href = '/'
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-text transition-colors hover:bg-subtle hover:text-heading"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {t('nav.logOut')}
        </button>
        <div className="mt-2 flex gap-3 px-3 pb-1">
          <Link href="/privacy" className="text-xs text-muted-text/70 hover:text-muted-text">{t('nav.privacy')}</Link>
          <Link href="/terms" className="text-xs text-muted-text/70 hover:text-muted-text">{t('nav.terms')}</Link>
        </div>
      </div>
    </aside>
  )
}
