// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { Tag, CheckSquare, Square } from "lucide-react"
import { useCategories } from "@/lib/use-categories"

/**
 * CATEGORY_FILTER_CHANGE event detail shape.
 * When selectedIds is empty it means "show all".
 */
export const CATEGORY_FILTER_EVENT = "category:filter"

export function CategoryFilter() {
    const { categories, loading } = useCategories()
    const [selected, setSelected] = useState<Set<string>>(new Set())

    // Broadcast changes whenever selection changes
    useEffect(() => {
        window.dispatchEvent(
            new CustomEvent(CATEGORY_FILTER_EVENT, {
                detail: { selectedIds: [...selected] },
            })
        )
    }, [selected])

    const toggleAll = () => {
        if (selected.size === 0) {
            setSelected(new Set(categories.map((c) => c.id)))
        } else {
            setSelected(new Set())
        }
    }

    const toggle = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const allSelected = selected.size === 0
    const someSelected = selected.size > 0 && selected.size < categories.length

    return (
        <div className="mt-4 space-y-2">
            {/* Header */}
            <div className="px-1 flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Filter by Category
                </p>
            </div>

            {/* Filter box */}
            <div className="rounded-xl border border-primary/20 bg-card/95 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="px-3 py-4 text-xs text-secondary-foreground/60 text-center">
                        Loading categories…
                    </div>
                ) : categories.length === 0 ? (
                    <div className="px-3 py-4 text-xs text-secondary-foreground/60 text-center">
                        No categories found.
                    </div>
                ) : (
                    <ul className="divide-y divide-primary/10">
                        {/* "All" toggle row */}
                        <li>
                            <button
                                onClick={toggleAll}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-secondary/40 transition-colors duration-150 group"
                            >
                                <span
                                    className={`shrink-0 transition-colors ${allSelected
                                            ? "text-primary"
                                            : "text-secondary-foreground/40 group-hover:text-secondary-foreground/70"
                                        }`}
                                >
                                    {allSelected ? (
                                        <CheckSquare className="h-4 w-4" />
                                    ) : (
                                        <Square className="h-4 w-4" />
                                    )}
                                </span>
                                <span
                                    className={`text-sm truncate ${allSelected
                                            ? "font-semibold text-primary"
                                            : "text-secondary-foreground/70"
                                        }`}
                                >
                                    All Categories
                                </span>
                                {someSelected && (
                                    <span className="ml-auto text-xs text-secondary-foreground/50 shrink-0">
                                        {selected.size}/{categories.length}
                                    </span>
                                )}
                            </button>
                        </li>

                        {/* Individual category rows */}
                        {categories.map((cat) => {
                            const isActive = selected.has(cat.id)
                            return (
                                <li key={cat.id}>
                                    <button
                                        onClick={() => toggle(cat.id)}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-secondary/40 transition-colors duration-150 group"
                                    >
                                        <span
                                            className={`shrink-0 transition-colors ${isActive
                                                    ? "text-primary"
                                                    : "text-secondary-foreground/40 group-hover:text-secondary-foreground/70"
                                                }`}
                                        >
                                            {isActive ? (
                                                <CheckSquare className="h-4 w-4" />
                                            ) : (
                                                <Square className="h-4 w-4" />
                                            )}
                                        </span>
                                        <span
                                            className={`text-sm truncate ${isActive
                                                    ? "font-medium text-primary"
                                                    : "text-secondary-foreground/70"
                                                }`}
                                        >
                                            {cat.name}
                                        </span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>

            {/* Hint */}
            {!loading && categories.length > 0 && (
                <p className="text-xs text-secondary-foreground/40 px-1">
                    {selected.size === 0
                        ? "Showing all categories"
                        : `Showing ${selected.size} categor${selected.size === 1 ? "y" : "ies"}`}
                </p>
            )}
        </div>
    )
}
