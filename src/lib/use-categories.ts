"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export interface Category {
    id: string
    name: string
}

/**
 * Global hook to fetch categories from Supabase.
 * Can be used in AddThread, CategoryFilter, or anywhere else.
 * The client is created once via useRef so auth-helpers can sync the session.
 */
export function useCategories() {
    const supabaseRef = useRef(createClient())
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const supabase = supabaseRef.current
        let active = true

        const load = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from("categories")
                .select("id, name")
                .order("name", { ascending: true })

            if (!active) return
            if (error) {
                setError(error.message)
            } else {
                setCategories((data as Category[]) || [])
            }
            setLoading(false)
        }

        load()
        return () => {
            active = false
        }
    }, [])

    return { categories, loading, error }
}
