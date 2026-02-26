// @ts-nocheck
"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { AddThread } from "./components/add-thread"
import { toast } from "sonner"
import { ThreadCard } from "./components/thread-card"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CATEGORY_FILTER_EVENT } from "./components/category-filter"

export default function MainBoard() {
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current
  const router = useRouter()
  const [threads, setThreads] = useState([])
  const [selectedThreadId, setSelectedThreadId] = useState(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  // selectedCategories: empty set = show all, otherwise filter by these IDs
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())

  // Listen for category filter events dispatched by CategoryFilter in the sidebar
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const ids: string[] = e.detail?.selectedIds ?? []
      setSelectedCategories(new Set(ids))
    }
    window.addEventListener(CATEGORY_FILTER_EVENT as any, handler)
    return () => window.removeEventListener(CATEGORY_FILTER_EVENT as any, handler)
  }, [])

  useEffect(() => {
    let active = true

    const loadThreads = async () => {
      setLoading(true)
      try {
        const { data: threadRows, error: threadsError } = await supabase
          .from("threads")
          .select("id, title, content, created_at, author_id, category_id")
          .order("created_at", { ascending: false })

        if (threadsError) {
          toast.error(threadsError.message)
          return
        }

        const threadsData = threadRows || []
        const authorIds = [...new Set(threadsData.map((t) => t.author_id).filter(Boolean))]

        let usernameById: Record<string, string> = {}
        if (authorIds.length > 0) {
          const { data: profileRows, error: profilesError } = await supabase
            .from("profiles")
            .select("id, username")
            .in("id", authorIds)

          if (profilesError) {
            toast.error(profilesError.message)
          } else {
            usernameById = (profileRows || []).reduce((acc, p) => {
              acc[p.id] = p.username
              return acc
            }, {} as Record<string, string>)
          }
        }

        if (!active) return
        setThreads(
          threadsData.map((t) => ({
            ...t,
            author_username: usernameById[t.author_id] ?? "Unknown",
          }))
        )
      } catch (err: any) {
        if (active) toast.error(err?.message ?? "Failed to load threads.")
      } finally {
        if (active) setLoading(false)
      }
    }

    loadThreads()

    const onThreadCreated = () => loadThreads()
    window.addEventListener("thread:created", onThreadCreated)

    return () => {
      active = false
      window.removeEventListener("thread:created", onThreadCreated)
    }
  }, [])

  const filteredThreads = useMemo(() => {
    let result = threads

    // Apply category filter (empty set = show all)
    if (selectedCategories.size > 0) {
      result = result.filter((t) => selectedCategories.has(t.category_id))
    }

    // Apply search filter
    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter((t) =>
        `${t.title || ""} ${t.content || ""}`.toLowerCase().includes(q)
      )
    }

    return result
  }, [threads, search, selectedCategories])

  const handleOpenThread = (id: string) => {
    setSelectedThreadId(id)
    router.push(`/main/${id}`)
  }

  return (
    <div className="min-h-screen flex justify-center bg-linear-to-b from-secondary/20 via-background to-background">
      <div className="w-full max-w-5xl px-4 md:px-6 py-4 md:py-6">
        <main className="flex flex-col gap-4 min-h-0 h-[calc(100vh-3.5rem)]">
          {/* Top bar */}
          <section className="rounded-xl border border-primary/20 bg-card/80 backdrop-blur-sm p-4 md:p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between shadow-sm">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-primary">Threads</h1>
              <p className="text-sm text-secondary-foreground/90">
                Browse and join discussions
              </p>
            </div>
            <AddThread />
          </section>

          {/* Search */}
          <section className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-foreground/80" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search threads..."
              className="pl-9 border-secondary/60 bg-secondary/20 focus-visible:ring-primary/40"
            />
          </section>

          {/* Thread list */}
          <div className="min-h-0 flex-1">
            <ScrollArea className="h-full pr-2">
              <div className="flex flex-col gap-3 pb-2">
                {loading ? (
                  <Card className="border-secondary/50 bg-secondary/20">
                    <CardContent className="p-4 text-sm text-secondary-foreground">
                      Loading threads...
                    </CardContent>
                  </Card>
                ) : filteredThreads.length === 0 ? (
                  <Card className="border-secondary/50 bg-secondary/20">
                    <CardContent className="p-4 text-sm text-secondary-foreground">
                      No threads found.
                    </CardContent>
                  </Card>
                ) : (
                  filteredThreads.map((thread) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      authorName={thread.author_username}
                      onOpen={handleOpenThread}
                      upvotes={thread.upvotes_count ?? thread.upvotes ?? 0}
                      downvotes={thread.downvotes_count ?? thread.downvotes ?? 0}
                      comments={thread.comments_count ?? thread.comment_count ?? 0}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </main>
      </div>
    </div>
  )
}