// @ts-nocheck
"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Menu, Search, User, Filter, ArrowLeft, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { AddThread } from "./components/add-thread"
import { toast } from "sonner"
import { CreateProfileDialog } from "./components/create-profile"

function formatCount(n) {
  if (!n) return "0"
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)
}

export default function MainBoard() {
  const supabase = createClient()
  const [threads, setThreads] = useState([])
  const [selectedThreadId, setSelectedThreadId] = useState(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadThreads = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("threads")
        .select("id,title,content,created_at")
        .order("created_at", { ascending: false })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      setThreads(data || [])
      setLoading(false)
    }

    loadThreads()
  }, [supabase])

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return threads
    return threads.filter((t) =>
      `${t.title || ""} ${t.content || ""}`.toLowerCase().includes(q)
    )
  }, [threads, search])

  const selectedThread = useMemo(
    () => threads.find((t) => t.id === selectedThreadId) || null,
    [threads, selectedThreadId]
  )

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center font-sans">
      <div className="w-full max-w-7xl flex gap-6 p-4 md:p-6 items-start">
        <aside className="hidden md:flex flex-col w-62.5 shrink-0 sticky top-6 gap-6">
          <Card className="rounded-2xl border-2 border-slate-200 shadow-sm">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-12 w-12 border-2 border-slate-200">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
                <div className="font-semibold text-lg">Name</div>
              </div>

              <AddThread />

              <CreateProfileDialog />

              <Button variant="ghost" className="w-full justify-start mt-2 text-slate-500">
                <Menu className="mr-2 h-5 w-5" />
                Menu
              </Button>
            </CardContent>
          </Card>
        </aside>

        {selectedThread ? (
          <div className="flex-1 flex flex-col min-w-0 gap-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedThreadId(null)}
                className="rounded-full border-2 border-slate-200 shrink-0 hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 flex-1 font-bold text-lg text-slate-800 shadow-sm">
                {selectedThread.title}
              </div>
            </div>

            <Card className="rounded-3xl border-2 border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedThread.content}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <main className="flex-1 flex flex-col min-w-0 gap-6">
            <div className="flex flex-col gap-4">
              {loading ? (
                <Card className="rounded-3xl border-2 border-slate-200 shadow-sm">
                  <CardContent className="p-6 text-slate-500">Loading threads...</CardContent>
                </Card>
              ) : filteredThreads.length === 0 ? (
                <Card className="rounded-3xl border-2 border-slate-200 shadow-sm">
                  <CardContent className="p-6 text-slate-500">No threads found.</CardContent>
                </Card>
              ) : (
                filteredThreads.map((thread) => (
                  <Card
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className="rounded-3xl border-2 border-slate-200 shadow-sm cursor-pointer hover:border-slate-400 hover:shadow-md transition-all duration-200 group"
                  >
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-slate-900">
                        {thread.title}
                      </h2>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">
                        {thread.content}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-sm text-white bg-slate-700 rounded-full px-3 py-1 font-semibold">
                        <MessageCircle className="h-4 w-4" />
                        {formatCount(0)}
                      </span>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </main>
        )}

        {!selectedThread && (
          <aside className="hidden lg:flex flex-col w-75 shrink-0 sticky top-6 gap-6">
            <Card className="rounded-3xl border-2 border-slate-200 shadow-sm">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search threads"
                    className="pl-9 rounded-xl border-2"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button variant="ghost" className="w-full justify-start text-slate-600">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </CardContent>
            </Card>
          </aside>
        )}
      </div>
    </div>
  )
}