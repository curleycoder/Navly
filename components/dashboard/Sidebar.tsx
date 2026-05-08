'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Flame,
  ListChecks,
  MessageSquare,
  ShieldCheck,
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

const allNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, outsideOk: true },
  { href: '/dashboard/pr-tracker', label: 'PR Readiness', icon: TrendingUp, outsideOk: true },
  { href: '/dashboard/days', label: 'Days in Canada', icon: Flame, outsideOk: false },
  { href: '/dashboard/tasks', label: 'Tasks', icon: ListChecks, outsideOk: true },
  { href: '/dashboard/news', label: 'Immigration News', icon: Newspaper, outsideOk: true },
  { href: '/dashboard/chat', label: 'AI Assistant', icon: MessageSquare, outsideOk: true },
  { href: '/dashboard/prep', label: 'Consultation Checklist', icon: ShieldCheck, outsideOk: true },
  { href: '/dashboard/consultants', label: 'Find a Consultant', icon: Users, outsideOk: true },
]

// Keep this export for MobileNav
export const navItems = allNavItems

export function Sidebar() {
  const pathname = usePathname()
  const [isOutside, setIsOutside] = useState(false)

  useEffect(() => {
    const profile = loadProfile()
    setIsOutside(profile?.locationStatus === 'outside')
  }, [])

  const visibleItems = allNavItems.filter((item) => !isOutside || item.outsideOk)

  return (
    <aside className="hidden h-full w-60 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        <Link href="/">
          <NavlyLogo size="sm" />
        </Link>
      </div>

      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 p-3">
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                active
                  ? 'bg-[#0B1F3A] text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A]'
              )}
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <Link
          href="/dashboard/profile"
          aria-current={pathname === '/dashboard/profile' ? 'page' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
            pathname === '/dashboard/profile'
              ? 'bg-[#0B1F3A] text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A]'
          )}
        >
          <UserCircle className="h-4 w-4 shrink-0" />
          Edit Profile
        </Link>
        <div className="my-2 border-t border-slate-100" />
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            localStorage.clear()
            window.location.href = '/'
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#0B1F3A]"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Log out
        </button>
        <div className="mt-2 flex gap-3 px-3 pb-1">
          <Link href="/privacy" className="text-xs text-slate-400 hover:text-slate-600">Privacy</Link>
          <Link href="/terms" className="text-xs text-slate-400 hover:text-slate-600">Terms</Link>
        </div>
      </div>
    </aside>
  )
}
