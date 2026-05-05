'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, LogOut, UserCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet'
import { NavlyLogo } from '@/components/ui/NavlyLogo'
import { navItems } from '@/components/dashboard/Sidebar'
import { cn } from '@/lib/utils'
import { loadProfile } from '@/lib/profile'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const [isOutside, setIsOutside] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const profile = loadProfile()
    setIsOutside(profile?.locationStatus === 'outside')
  }, [])

  const visibleItems = navItems.filter((item) => !isOutside || item.outsideOk)

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
      <Link href="/">
        <NavlyLogo size="sm" />
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <SheetContent side="left" showCloseButton={false} className="w-64 p-0">
          <div className="flex h-14 items-center border-b border-slate-200 px-5">
            <NavlyLogo size="sm" />
          </div>

          <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 p-3">
            {visibleItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <SheetClose
                  key={href}
                  render={
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                        active
                          ? 'bg-[#0B1F3A] text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A]'
                      )}
                    />
                  }
                >
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                  {label}
                </SheetClose>
              )
            })}
          </nav>

          <div className="border-t border-slate-200 p-3">
            <SheetClose
              render={
                <Link
                  href="/dashboard/profile"
                  aria-current={pathname === '/dashboard/profile' ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                    pathname === '/dashboard/profile'
                      ? 'bg-[#0B1F3A] text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A]'
                  )}
                />
              }
            >
              <UserCircle className="h-4 w-4 shrink-0" />
              Edit Profile
            </SheetClose>
            <div className="my-2 border-t border-slate-100" />
            <button
              onClick={() => {
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
        </SheetContent>
      </Sheet>
    </header>
  )
}
