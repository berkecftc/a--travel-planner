"use client";

import Link from "next/link";
import { MapPin, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
  <Link href="/" className="flex items-center gap-2 font-semibold transition-transform hover:-translate-y-0.5">
          <MapPin className="h-5 w-5 text-primary" />
          <span>AI Travel</span>
        </Link>
  <nav className="ml-auto hidden items-center gap-4 md:flex">
          <Link href="#how" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Nasıl Çalışır</Link>
          <Link href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">İletişim</Link>
          <ThemeToggle />
        </nav>
        <button
          className="ml-auto md:hidden h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
          aria-label="Menü"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobil menü paneli */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden border-b transition-[max-height] duration-300 ${open ? "max-h-64" : "max-h-0"}`}
      >
        <div className="container mx-auto flex flex-col gap-3 px-4 py-4">
          
          <Link href="#how" onClick={() => setOpen(false)} className="text-sm">Nasıl Çalışır</Link>
          <Link href="#contact" onClick={() => setOpen(false)} className="text-sm">İletişim</Link>
          <ThemeToggle className="self-start" />
        </div>
      </div>
    </header>
  );
}
