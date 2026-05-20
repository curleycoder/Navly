"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { NavlyLogo } from "@/components/ui/NavlyLogo";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="relative mx-auto flex max-w-7xl items-center px-6 py-4">
        <NavlyLogo size="sm" />

        {/* Desktop centered nav */}
        <div className=" pt-5 pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
          <nav className="pointer-events-auto flex items-center gap-12 text-sm font-medium text-slate-600">
            <a href="#features" className="transition hover:text-[#0B1F3A]">Features</a>
            <a href="#how" className="transition hover:text-[#0B1F3A]">How it works</a>
            <a href="#pricing" className="transition hover:text-[#0B1F3A]">Pricing</a>
          </nav>
        </div>

        {/* Desktop right buttons */}
        <div className="ml-auto hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-[#D62828] px-4 py-2 text-sm font-semibold text-[#D62828] transition hover:bg-[#D62828] hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 rounded-lg bg-[#D62828] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#B91C1C]"
          >
            Start Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="ml-auto flex items-center justify-center rounded-lg p-2 text-[#0B1F3A] transition hover:bg-slate-100 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-6 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col text-sm font-medium text-slate-600">
            <a href="#features" className="py-3 transition hover:text-[#0B1F3A]" onClick={() => setOpen(false)}>Features</a>
            <hr className="border-slate-100" />
            <a href="#how" className="py-3 transition hover:text-[#0B1F3A]" onClick={() => setOpen(false)}>How it works</a>
            <hr className="border-slate-100" />
            <a href="#pricing" className="py-3 transition hover:text-[#0B1F3A]" onClick={() => setOpen(false)}>Pricing</a>
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-[#D62828] px-4 py-2.5 text-sm font-semibold text-[#D62828] transition hover:bg-[#D62828] hover:text-white"
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D62828] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#B91C1C]"
              onClick={() => setOpen(false)}
            >
              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
