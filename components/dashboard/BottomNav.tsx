'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, LayoutDashboard, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const BOTTOM_TABS = [
  { href: '/dashboard/pr-tracker', label: 'Tracker', icon: TrendingUp },
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/chat', label: 'AI', icon: MessageSquare },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch border-t border-slate-200 bg-white md:hidden"
    >
      {BOTTOM_TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors',
              active ? 'text-[#0B1F3A]' : 'text-slate-400 hover:text-[#0B1F3A]'
            )}
          >
            {active && (
              <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-[#D62828]" />
            )}
            <Icon className={cn('h-5 w-5', active ? 'text-[#D62828]' : 'text-slate-400')} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
