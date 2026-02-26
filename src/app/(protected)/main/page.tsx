// @ts-nocheck
"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { AddThread } from "./components/add-thread"
import { toast } from "sonner"
import { ThreadCard } from "./components/thread-card"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function MainBoard() {
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current
  const router = useRouter()
  const [threads, setThreads] = useState([])
  const [selectedThreadId, setSelectedThreadId] = useState(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadThreads = async () => {
      setLoading(true)
      try {
        const { data: threadRows, error: threadsError } = await supabase
          .from("threads")
          .select("id, title, content, created_at, author_id")
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
    return () => {
      active = false
    }
  }, [])

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return threads
    return threads.filter((t) =>
      `${t.title || ""} ${t.content || ""}`.toLowerCase().includes(q)
    )
  }, [threads, search])

  const handleOpenThread = (id: string) => {
    setSelectedThreadId(id)
    router.push(`/main/${id}`)
  }

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-6xl px-4 md:px-6 py-4 md:py-6">
        <main className="flex flex-col gap-4">
          {/* Top bar */}
          <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Threads</h1>
              <p className="text-sm text-muted-foreground">Browse and join discussions</p>
            </div>
            <AddThread />
          </section>

          {/* Search */}
          <section className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search threads..."
              className="pl-9"
            />
          </section>

          {/* Thread list */}
          <ScrollArea className="h-[calc(100vh-12rem)] pr-2">
            <div className="flex flex-col gap-3">
              {loading ? (
                <Card>
                  <CardContent className="p-4 text-sm text-muted-foreground">
                    Loading threads...
                  </CardContent>
                </Card>
              ) : filteredThreads.length === 0 ? (
                <Card>
                  <CardContent className="p-4 text-sm text-muted-foreground">
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
        </main>
      </div>
    </div>
  )
}