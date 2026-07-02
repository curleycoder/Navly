'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, MapPin, ListChecks, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const BOTTOM_TABS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard, tourId: undefined },
  { href: '/dashboard/dates', label: 'Dates', icon: CalendarDays, tourId: 'nav-dates' },
  { href: '/dashboard/days', label: 'Travel', icon: MapPin, tourId: 'nav-travel' },
  { href: '/dashboard/tasks', label: 'Tasks', icon: ListChecks, tourId: 'nav-tasks' },
  { href: '/dashboard/chat', label: 'Ask', icon: MessageSquare, tourId: 'nav-ai' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch border-t border-subtle bg-surface-card md:hidden"
    >
      {BOTTOM_TABS.map(({ href, label, icon: Icon, tourId }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            {...(tourId ? { 'data-tour': tourId } : {})}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors',
              active ? 'text-heading' : 'text-muted-text/70 hover:text-heading'
            )}
          >
            {active && (
              <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-navly-red" />
            )}
            <Icon className={cn('h-5 w-5', active ? 'text-navly-red' : 'text-muted-text/70')} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
