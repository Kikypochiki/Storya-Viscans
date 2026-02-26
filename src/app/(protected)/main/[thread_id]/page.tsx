"use client"

import React from "react"
import { ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function ThreadContentPage() {
  const supabaseRef = React.useRef(createClient())
  const supabase = supabaseRef.current
  const router = useRouter()
  const params = useParams()

  const threadId = React.useMemo(() => {
    const raw = params?.thread_id
    return Array.isArray(raw) ? raw[0] : raw
  }, [params])

  const [thread, setThread] = React.useState<any | null>(null)
  const [authorUsername, setAuthorUsername] = React.useState("unknown")
  const [loading, setLoading] = React.useState(true)
  const [errorText, setErrorText] = React.useState("")

  React.useEffect(() => {
    let active = true

    const loadThread = async () => {
      if (!threadId) {
        if (active) {
          setErrorText("Invalid thread id.")
          setLoading(false)
        }
        return
      }

      setLoading(true)
      setErrorText("")

      try {
        const { data, error } = await supabase
          .from("threads")
          .select("id, title, content, created_at, author_id")
          .eq("id", threadId)
          .single()

        if (!active) return

        if (error || !data) {
          setThread(null)
          setErrorText("Thread not found or inaccessible.")
          if (error) toast.error(error.message)
          return
        }

        setThread(data)

        if (data.author_id) {
          const { data: profileRow, error: profileError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", data.author_id)
            .maybeSingle()

          if (!profileError && profileRow?.username) {
            setAuthorUsername(profileRow.username)
          } else {
            setAuthorUsername("unknown")
          }
        } else {
          setAuthorUsername("unknown")
        }
      } catch (err: any) {
        if (active) {
          setThread(null)
          setErrorText("Failed to load thread.")
          toast.error(err?.message ?? "Failed to load thread.")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadThread()
    return () => {
      active = false
    }
  }, [threadId])

  const createdAt = thread?.created_at
    ? new Date(thread.created_at).toLocaleString()
    : ""

  return (
    <div className="min-h-screen flex justify-center bg-linear-to-b from-secondary/20 via-background to-background">
      <div className="w-full max-w-4xl px-4 py-4 md:px-6 md:py-6 flex flex-col gap-4">
        <section className="rounded-xl border border-primary/20 bg-card/80 backdrop-blur-sm p-3 md:p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              aria-label="Back"
              className="text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">
                Thread
              </p>
              <h1 className="text-lg md:text-xl font-bold truncate text-primary">
                {loading ? "Loading thread..." : thread?.title || "Thread"}
              </h1>
              {!loading && !errorText ? (
                <p className="text-xs text-secondary-foreground/90 truncate">
                  @{authorUsername} {createdAt ? `• ${createdAt}` : ""}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <Card className="border-secondary/50 bg-card/95 shadow-sm">
          <CardContent className="p-4 md:p-6">
            {loading ? (
              <p className="text-sm text-secondary-foreground">Loading content...</p>
            ) : errorText ? (
              <p className="text-sm text-secondary-foreground">{errorText}</p>
            ) : (
              <ScrollArea className="max-h-[calc(100vh-16rem)] pr-2">
                <div className="whitespace-pre-wrap break-words leading-7 text-sm md:text-base text-foreground">
                  {thread?.content}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}