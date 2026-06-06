"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { NavlyLogo } from "@/components/ui/NavlyLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-(--page-border) bg-(--navbar-bg) shadow-sm backdrop-blur">
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6">
        {/* Left: Logo */}
        <div className="col-start-1 flex items-center justify-start">
          <Link
            href="/"
            aria-label="Navly home"
            onClick={() => setOpen(false)}
            className="flex items-center"
          >
            <NavlyLogo size="sm" />
          </Link>
        </div>

        {/* Center: Desktop nav */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center justify-center gap-12 text-sm font-semibold text-(--page-body) md:flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex h-10 items-center transition hover:text-(--page-heading)"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Desktop buttons + theme toggle + mobile hamburger */}
        <div className="col-start-3 flex items-center justify-end gap-2">
          <Link
            href="/login"
            className="hidden h-11 items-center justify-center rounded-2xl border border-(--page-border) px-5 text-sm font-bold text-(--page-heading) transition hover:border-[#D62828] hover:text-[#D62828] md:inline-flex"
          >
            Log in
          </Link>

          <Link
            href="/onboarding"
            className="hidden h-11 items-center justify-center gap-2 rounded-2xl bg-[#D62828] px-5 text-sm font-bold text-white transition hover:bg-[#B91C1C] md:inline-flex"
          >
            Check My PR Pathway <ArrowRight className="h-4 w-4" />
          </Link>

          <ThemeToggle />

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-(--page-heading) transition hover:bg-(--page-alt) md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          className="border-t border-(--page-border) bg-(--navbar-solid) px-6 py-5 shadow-lg md:hidden"
        >
          <nav
            aria-label="Mobile navigation"
            className="flex flex-col divide-y divide-(--page-divider) text-sm font-semibold text-(--page-heading)"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-3 transition hover:text-[#D62828]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-5 flex flex-col gap-3">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-(--page-border) px-4 text-sm font-bold text-(--page-heading) transition hover:border-[#D62828] hover:text-[#D62828]"
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>

            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#D62828] px-4 text-sm font-bold text-white transition hover:bg-[#B91C1C]"
              onClick={() => setOpen(false)}
            >
              Check My PR Pathway <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-4 text-center text-xs leading-5 text-(--page-body)">
            Educational planning only. Not legal advice.
          </p>
        </div>
      )}
    </header>
  );
}
