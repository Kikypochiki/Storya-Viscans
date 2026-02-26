"use client"

import React from "react"
import { ArrowLeft, ThumbsUp, ThumbsDown, ChevronRight, ChevronDown } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Comments } from "@/types"
import Image from "next/image"

type CommentNode = {
  id: string
  content: string
  created_at: string
  author_id: string
  author_username: string
  parent_id: string | null
  children: CommentNode[]
}

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
    const [comments, setComments] = React.useState<CommentNode[]>([])
    const [replyFor, setReplyFor] = React.useState<string | null>(null)
    const [replyText, setReplyText] = React.useState("")
    const [submittingReply, setSubmittingReply] = React.useState(false)
    const [collapsedComments, setCollapsedComments] = React.useState<Set<string>>(new Set())

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
                    .select("id, title, content, created_at, author_id, image_urls")
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

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("id")
                .eq("user_id", authData.user.id)
                .maybeSingle()

            if (profileError || !profile?.id) {
                toast.error("Profile not found for current user.")
                return
            }

            const { error: insertError } = await supabase.from("comments").insert({
                thread_id: threadId,
                author_id: profile.id,
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
                    parent_id,
                    profiles!comments_author_id_fkey(username)
                `)
                .eq("thread_id", threadId)
                .order("created_at", { ascending: true })

            if (error) {
                toast.error(error.message)
                return
            }

            const flat: CommentNode[] = (data ?? []).map((row: any) => ({
                id: row.id,
                content: row.content,
                created_at: row.created_at,
                author_id: row.author_id,
                parent_id: row.parent_id ?? null,
                author_username: row.profiles?.username ?? "unknown",
                children: [],
            }))

            const byId = new Map<string, CommentNode>()
            flat.forEach((c) => byId.set(c.id, c))

            const roots: CommentNode[] = []
            flat.forEach((c) => {
                if (c.parent_id && byId.has(c.parent_id)) {
                    byId.get(c.parent_id)!.children.push(c)
                } else {
                    roots.push(c)
                }
            })

            setComments(roots)
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

    const submitReply = async (parentId: string) => {
        const content = replyText.trim()
        if (!content || !threadId) return

        setSubmittingReply(true)
        try {
            const { data: authData, error: userError } = await supabase.auth.getUser()
            if (userError || !authData?.user) {
                toast.error("You must be logged in to reply.")
                return
            }

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("id")
                .eq("user_id", authData.user.id)
                .maybeSingle()

            if (profileError || !profile?.id) {
                toast.error("Profile not found for current user.")
                return
            }

            const { error } = await supabase.from("comments").insert({
                thread_id: threadId,
                author_id: profile.id,
                content,
                parent_id: parentId,
            })

            if (error) {
                toast.error(error.message)
                return
            }

            toast.success("Reply added.")
            setReplyText("")
            setReplyFor(null)
            await fetchComments()
        } finally {
            setSubmittingReply(false)
        }
    }

    const toggleCollapse = React.useCallback((commentId: string) => {
        setCollapsedComments((prev) => {
            const next = new Set(prev)
            if (next.has(commentId)) {
                next.delete(commentId)
            } else {
                next.add(commentId)
            }
            return next
        })
    }, [])

    const renderComments = (list: CommentNode[], depth = 0): React.ReactNode => (
        <div className="space-y-3">
            {list.map((comment) => {
                const hasChildren = comment.children.length > 0
                const isCollapsed = collapsedComments.has(comment.id)

                return (
                    <div key={comment.id} className="relative">
                        {/* horizontal connector from parent rail to this comment */}
                        {depth > 0 && (
                            <div className="absolute -left-3 top-6 h-px w-3 bg-border/70" />
                        )}

                        <div className="rounded-md border p-3 bg-secondary/20">
                            <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                                {comment.content}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                @{comment.author_username} •{" "}
                                {comment.created_at ? new Date(comment.created_at).toLocaleString() : ""}
                            </p>

                            <div className="mt-2 flex items-center gap-2">
                                {hasChildren && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs"
                                        onClick={() => toggleCollapse(comment.id)}
                                    >
                                        {isCollapsed ? (
                                            <ChevronRight className="h-4 w-4 mr-1" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 mr-1" />
                                        )}
                                        {isCollapsed ? "Show" : "Hide"} replies ({comment.children.length})
                                    </Button>
                                )}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setReplyFor((prev) => (prev === comment.id ? null : comment.id))
                                        setReplyText("")
                                    }}
                                >
                                    Reply
                                </Button>
                            </div>

                            {replyFor === comment.id && (
                                <div className="mt-2 space-y-2">
                                    <Textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Write a reply..."
                                        className="min-h-20"
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            size="sm"
                                            onClick={() => submitReply(comment.id)}
                                            disabled={submittingReply || !replyText.trim()}
                                        >
                                            {submittingReply ? "Posting..." : "Post reply"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* single vertical rail for this comment's child group */}
                        {hasChildren && !isCollapsed && (
                            <div className="relative mt-2 ml-3 pl-4">
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-border/70" />
                                {renderComments(comment.children, depth + 1)}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )

    return (
        <div className="min-h-screen flex justify-center bg-linear-to-b from-secondary/20 via-background to-background">
            <div className="w-full max-w-4xl px-4 py-4 md:px-6 md:py-6 flex flex-col gap-4">
            <div>
                <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                aria-label="Back"
                className="mb-3 text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                >
                <ArrowLeft className="h-5 w-5" />
                </Button>

                <Card className="border-secondary/50 bg-card/95 shadow-sm">
                <CardContent className="p-4 md:p-6">
                    {loading ? (
                    <p className="text-sm text-secondary-foreground">Loading content...</p>
                    ) : errorText ? (
                    <p className="text-sm text-secondary-foreground">{errorText}</p>
                    ) : (
                    <>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary/80 mb-2">
                        Thread
                        </p>
                        <h1 className="text-lg md:text-xl font-bold text-primary mb-2">
                        {thread?.title || "Thread"}
                        </h1>
                        {!loading && !errorText ? (
                        <p className="text-xs text-secondary-foreground/90 mb-4">
                            @{authorUsername} {createdAt ? `• ${createdAt}` : ""}
                        </p>
                        ) : null}

                        <ScrollArea className="max-h-[calc(100vh-16rem)] pr-2 mb-4">
                        <div className="whitespace-pre-wrap warp-break-words leading-7 text-sm md:text-base text-foreground">
                            {thread?.content}
                        </div>
                        </ScrollArea>
                        <div className="flex gap-2 pt-4 border-t border-secondary/30">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Upvote
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            Downvote
                        </Button>
                        <AddComment
                            threadId={threadId!}
                            onSuccess={fetchComments}
                        />
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
                                <div className="space-y-6">
                                    <div className="whitespace-pre-wrap wrap-break-words leading-7 text-sm md:text-base text-foreground">
                                        {thread?.content}
                                    </div>

                                    {thread?.image_urls && thread.image_urls.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                            {thread.image_urls.map((url: string, idx: number) => (
                                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-primary/10 bg-secondary/10 group">
                                                    <Image
                                                        src={url}
                                                        alt={`${thread.title} - image ${idx + 1}`}
                                                        fill
                                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>
            </div>


                {!loading && !errorText && comments.length > 0 && (
                    <Card className="border-secondary/50 bg-card/95 shadow-sm">
                        <CardContent className="p-4 md:p-5">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
                                Comments
                            </h2>

                            <ScrollArea className="h-72 pr-2">
                                <div className="space-y-3">{renderComments(comments)}</div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}