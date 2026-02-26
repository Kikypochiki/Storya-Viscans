// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { ProfileCard } from "./components/profile-card"

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false)
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [])

    return (
        <div className="flex min-h-screen">
            {/* Left aside */}
            <aside
                className="
                    flex-shrink-0 overflow-hidden
                    border-r border-primary/20
                    bg-card/95 backdrop-blur-md
                    transition-all duration-300 ease-in-out
                    flex flex-col
                "
                style={{ width: isOpen ? "280px" : "0px" }}
                aria-hidden={!isOpen}
            >
                {/* Aside body */}
                <div className="flex-1 overflow-y-auto p-4 min-w-[280px]">
                    <ProfileCard />
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0 relative">
                {/* Hamburger button — fixed to the top-left of the content area */}
                <button
                    onClick={() => setIsOpen((prev) => !prev)}
                    aria-label={isOpen ? "Close profile menu" : "Open profile menu"}
                    className="
                        fixed top-4 left-4 z-50
                        flex items-center justify-center
                        h-10 w-10 rounded-xl
                        border border-primary/25
                        bg-card/90 backdrop-blur
                        text-primary shadow-md
                        transition-all duration-200
                        hover:bg-secondary hover:border-primary/50 hover:scale-105
                        active:scale-95
                    "
                    style={{
                        left: isOpen ? "calc(280px + 1rem)" : "1rem",
                        transition: "left 0.3s ease-in-out, background-color 0.2s, border-color 0.2s, transform 0.2s",
                    }}
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>

                {children}
            </div>
        </div>
    )
}
