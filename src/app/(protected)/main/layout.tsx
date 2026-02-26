// @ts-nocheck
"use client"

import { useState, useEffect, useRef } from "react"
import { Menu, X } from "lucide-react"
import { ProfileCard } from "./components/profile-card"

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const drawerRef = useRef<HTMLDivElement>(null)

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false)
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [])

    // Prevent body scroll when drawer is open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [isOpen])

    return (
        <>
            {children}

            {/* Hamburger button — fixed, always visible */}
            <button
                onClick={() => setIsOpen(true)}
                aria-label="Open profile menu"
                className="
          fixed top-4 right-4 z-50
          flex items-center justify-center
          h-10 w-10 rounded-xl
          border border-primary/25
          bg-card/90 backdrop-blur
          text-primary shadow-md
          transition-all duration-200
          hover:bg-secondary hover:border-primary/50 hover:scale-105
          active:scale-95
        "
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Backdrop */}
            <div
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
                className="
          fixed inset-0 z-40
          bg-black/40 backdrop-blur-sm
          transition-opacity duration-300
        "
                style={{
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? "auto" : "none",
                }}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className="
          fixed top-0 right-0 z-50
          h-full w-80 max-w-[90vw]
          flex flex-col
          border-l border-primary/20
          bg-card/95 backdrop-blur-md
          shadow-2xl
          transition-transform duration-300 ease-in-out
        "
                style={{
                    transform: isOpen ? "translateX(0)" : "translateX(100%)",
                }}
            >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-primary/15">
                    <p className="text-sm font-semibold text-primary tracking-wide">Menu</p>
                    <button
                        onClick={() => setIsOpen(false)}
                        aria-label="Close menu"
                        className="
              flex items-center justify-center
              h-8 w-8 rounded-lg
              text-muted-foreground
              hover:bg-secondary hover:text-secondary-foreground
              transition-colors duration-150
            "
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Drawer body */}
                <div className="flex-1 overflow-y-auto p-4">
                    <ProfileCard />
                </div>
            </div>
        </>
    )
}
