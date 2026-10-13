'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    // localStorage is unavailable during SSR, so this can't be a lazy useState initializer without a hydration mismatch
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDark(true)
    }
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-10 w-10 items-center justify-center rounded-xl text-(--page-body) transition hover:bg-(--page-alt) hover:text-(--page-heading)"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
