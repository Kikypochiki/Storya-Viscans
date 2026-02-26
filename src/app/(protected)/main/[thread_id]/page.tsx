"use client"

import React from "react"
import { ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
// import { ThumbsUp, ThumbsDown } from "lucide-react"
import type { Comments } from "@/types"

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
    const [commentText, setCommentText] = React.useState("")
    const [submittingComment, setSubmittingComment] = React.useState(false)
    const [comments, setComments] = React.useState<Comments[]>([])

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
    }, [threadId, supabase])

    const handleAddComment = async () => {
        const content = commentText.trim()

        if (!threadId) {
            toast.error("Invalid thread id.")
            return
        }

        if (!content) {
            toast.error("Comment cannot be empty.")
            return
        }

        setSubmittingComment(true)
        try {
            const { data: authData, error: userError } = await supabase.auth.getUser()
            if (userError || !authData?.user) {
                toast.error("You must be logged in to comment.")
                return
            }

            const { data: profileRow, error: profileError } = await supabase
                .from("profiles")
                .select("id")
                .eq("user_id", authData.user.id)
                .maybeSingle()

            if (profileError || !profileRow?.id) {
                toast.error("Profile not found for current user.")
                return
            }

            const { error: insertError } = await supabase.from("comments").insert({
                thread_id: threadId,
                author_id: profileRow.id,
                content,
            })

            if (insertError) {
                toast.error(insertError.message)
                return
            }

            setCommentText("")
            toast.success("Comment added.")
            await fetchComments()
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to add comment.")
        } finally {
            setSubmittingComment(false)
        }
    }

    const fetchComments = React.useCallback(async () => {
        if (!threadId) return

        try {
            const { data, error } = await supabase
                .from("comments")
                .select(`
                    id,
                    content,
                    created_at,
                    author_id,
                    profiles!comments_author_id_fkey(username)
                `)
                .eq("thread_id", threadId)
                .order("created_at", { ascending: true })

            if (error) {
                toast.error(error.message)
                return
            }

            const mapped = (data ?? []).map((row: any) => ({
                id: row.id,
                content: row.content,
                created_at: row.created_at,
                author_id: row.author_id,
                author_username: row.profiles?.username ?? "unknown",
            }))

            setComments(mapped as any)
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to fetch comments.")
        }
    }, [supabase, threadId])

    React.useEffect(() => {
        fetchComments()
    }, [fetchComments])

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
                                <div className="whitespace-pre-wrap wrap-break-words leading-7 text-sm md:text-base text-foreground">
                                    {thread?.content}
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>

                {!loading && !errorText && (
                    <Card className="border-primary/20 bg-card/95 shadow-sm">
                        <CardContent className="p-4 md:p-5 space-y-3">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                                Add Comment
                            </h2>
                            <Textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write your comment..."
                                className="min-h-24 border-secondary/60 bg-secondary/20 focus-visible:ring-primary/40"
                            />
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    onClick={handleAddComment}
                                    disabled={submittingComment || !commentText.trim()}
                                >
                                    {submittingComment ? "Posting..." : "Post comment"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {/* Comments list */}
                {!loading && !errorText && comments.length > 0 && (
                    <Card className="border-secondary/50 bg-card/95 shadow-sm">
                        <CardContent className="p-4 md:p-5">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
                                Comments
                            </h2>

                            <ScrollArea className="h-72 pr-2">
                                <div className="space-y-3">
                                    {comments.map((comment: any) => (
                                        <div key={comment.id} className="rounded-md border p-3 bg-secondary/20">
                                            <p className="text-sm text-foreground whitespace-pre-wrap warp-break-words">
                                                {comment.content}
                                            </p>
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                @{comment.author_username ?? "unknown"} •{" "}
                                                {comment.created_at
                                                    ? new Date(comment.created_at).toLocaleString()
                                                    : ""}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}