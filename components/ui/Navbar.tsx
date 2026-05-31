"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { NavlyLogo } from "@/components/ui/NavlyLogo";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
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
          className="hidden items-center justify-center gap-12 text-sm font-semibold text-slate-600 md:flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex h-10 items-center transition hover:text-[#0B1F3A]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Desktop buttons + Mobile hamburger */}
        <div className="col-start-3 flex items-center justify-end gap-3">
          <Link
            href="/login"
            className="hidden h-12 items-center justify-center rounded-2xl border border-slate-300 px-6 text-sm font-bold text-[#0B1F3A] transition hover:border-[#D62828] hover:text-[#D62828] md:inline-flex"
          >
            Log in
          </Link>

          <Link
            href="/onboarding"
            className="hidden h-12 items-center justify-center gap-2 rounded-2xl bg-[#D62828] px-6 text-sm font-bold text-white transition hover:bg-[#B91C1C] md:inline-flex"
          >
            Check My PR Pathway <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#0B1F3A] transition hover:bg-slate-100 md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          className="border-t border-slate-200 bg-white px-6 py-5 shadow-lg md:hidden"
        >
          <nav
            aria-label="Mobile navigation"
            className="flex flex-col divide-y divide-slate-100 text-sm font-semibold text-slate-700"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-3 transition hover:text-[#0B1F3A]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-5 flex flex-col gap-3">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-300 px-4 text-sm font-bold text-[#0B1F3A] transition hover:border-[#D62828] hover:text-[#D62828]"
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

          <p className="mt-4 text-center text-xs leading-5 text-slate-400">
            Educational planning only. Not legal advice.
          </p>
        </div>
      )}
    </header>
  );
}