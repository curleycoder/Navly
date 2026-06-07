'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Flame,
  ListChecks,
  MessageSquare,
  UserCircle,
  Users,
  LogOut,
  Newspaper,
  TrendingUp,
} from 'lucide-react'
import { NavlyLogo } from '@/components/ui/NavlyLogo'
import { cn } from '@/lib/utils'
import { loadProfile } from '@/lib/profile'
import { supabase } from '@/lib/supabase/client'
import { countUnread, type NewsUpdate } from '@/lib/news'
import { useLocale } from '@/lib/i18n'

const NAV_HREFS = [
  { href: '/dashboard', key: 'home' as const, icon: LayoutDashboard, outsideOk: true },
  { href: '/dashboard/pr-tracker', key: 'prTracker' as const, icon: TrendingUp, outsideOk: true },
  { href: '/dashboard/days', key: 'daysInCanada' as const, icon: Flame, outsideOk: false },
  { href: '/dashboard/tasks', key: 'tasks' as const, icon: ListChecks, outsideOk: true },
  { href: '/dashboard/news', key: 'immigrationNews' as const, icon: Newspaper, outsideOk: true },
  { href: '/dashboard/chat', key: 'aiAssistant' as const, icon: MessageSquare, outsideOk: true },
  { href: '/dashboard/consultants', key: 'consultant' as const, icon: Users, outsideOk: true },
]

// Keep this export for MobileNav
export const navItems = NAV_HREFS

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLocale()
  const [isOutside, setIsOutside] = useState(false)
  const [newsUnread, setNewsUnread] = useState(0)

  useEffect(() => {
    const profile = loadProfile()
    setIsOutside(profile?.locationStatus === 'outside')
  }, [])

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((items: NewsUpdate[]) => setNewsUnread(countUnread(items)))
      .catch(() => {})
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
          const isNews = href === '/dashboard/news'
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
              {isNews && newsUnread > 0 && !active && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-navly-red px-1.5 text-[10px] font-bold text-white">
                  {newsUnread > 9 ? '9+' : newsUnread}
                </span>
              )}
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
          {t('nav.editProfile')}
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
