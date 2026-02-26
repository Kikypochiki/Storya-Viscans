// @ts-nocheck
"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, Search, X } from "lucide-react"
import { ProfileCard } from "./components/profile-card"
import { CategoryFilter } from "./components/category-filter"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed header (Reddit-like) */}
      <header className="fixed top-0 left-0 right-0 z-50 h-12 border-b border-primary/20 bg-background/95 backdrop-blur">
        <div className="h-full px-3 md:px-4 flex items-center gap-3">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close profile menu" : "Open profile menu"}
            className="h-8 w-8 shrink-0 rounded-md border border-primary/25 bg-card/80 text-primary grid place-items-center"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {/* Replace text brand with logo */}
          <div className="shrink-0 flex items-center">
            <Image
              src="/logo.png"
              alt="Storya logo"
              width={96}
              height={24}
              priority
              className="h-6 w-auto object-contain"
            />
          </div>
        </div>
      </header>

      {/* Fixed sidebar below header */}
      <aside
        className={`
          fixed left-0 top-12 bottom-0 z-40
          overflow-hidden border-r border-primary/20
          bg-card/95 backdrop-blur-md
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-[240px]" : "w-0"}
        `}
        aria-hidden={!isOpen}
      >
        <div className="h-full overflow-y-auto p-3 min-w-[240px]">
          <ProfileCard />
          <CategoryFilter />
        </div>
      </aside>

      {/* Content area (offset by fixed header) */}
      <main className="pt-12 transition-[padding-left] duration-300 ease-in-out" style={{ paddingLeft: isOpen ? 240 : 0 }}>
        {children}
      </main>
    </div>
  )
}
