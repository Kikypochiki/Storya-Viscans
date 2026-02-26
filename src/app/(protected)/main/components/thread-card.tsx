import React, { useEffect, useRef, useState } from "react"
import { MessageCircle, ThumbsDown, ThumbsUp, ImageIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { updateThreadCounts } from "@/lib/votes"

function formatCount(n: number) {
  if (!n) return "0"
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)
}

type CategoryRow = {
  id: string | number
  name?: string | null
}

type ThreadCardProps = {
  thread: {
    id: string
    title: string
    content: string
    image_urls?: string[]
    image_prices?: number[] | null
    category_id?: string | number | null
    rfs?: string | null
  }
  categories?: CategoryRow[]
  onOpen?: (id: string) => void
  upvotes?: number
  downvotes?: number
  comments?: number
  authorName?: string
}

export function ThreadCard({
  thread,
  categories = [],
  onOpen,
  upvotes = 0,
  downvotes = 0,
  comments = 0,
  authorName,
}: ThreadCardProps) {
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const [commentCount, setCommentCount] = useState<number>(comments)
  const [localUpvotes, setLocalUpvotes] = useState<number>(upvotes)
  const [localDownvotes, setLocalDownvotes] = useState<number>(downvotes)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)

  const open = () => onOpen?.(thread.id)
  const hasImages = !!thread.image_urls?.length

  const category =
    thread.category_id != null
      ? categories.find((c) => String(c.id) === String(thread.category_id))
      : undefined

  const categoryLabel = category?.name || null

  useEffect(() => {
    let active = true

    const loadCommentCount = async () => {
      const { count, error } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("thread_id", thread.id)

      if (!active) return
      if (!error) setCommentCount(count ?? 0)
    }

    loadCommentCount()

    return () => {
      active = false
    }
  }, [supabase, thread.id])

  useEffect(() => {
    setCommentCount(comments)
  }, [comments])

  useEffect(() => {
    setLocalUpvotes(upvotes)
  }, [upvotes])

  useEffect(() => {
    setLocalDownvotes(downvotes)
  }, [downvotes])

  const handleVote = async (type: "up" | "down") => {
    const oldUp = localUpvotes
    const oldDown = localDownvotes
    const oldVote = userVote

    let newUp = oldUp
    let newDown = oldDown
    let newVote: "up" | "down" | null = type

    if (oldVote === type) {
      // Toggle off
      if (type === "up") newUp = Math.max(0, oldUp - 1)
      else newDown = Math.max(0, oldDown - 1)
      newVote = null
    } else if (oldVote === null) {
      // New vote
      if (type === "up") newUp = oldUp + 1
      else newDown = oldDown + 1
    } else {
      // Switch vote
      if (type === "up") {
        newUp = oldUp + 1
        newDown = Math.max(0, oldDown - 1)
      } else {
        newDown = oldDown + 1
        newUp = Math.max(0, oldUp - 1)
      }
    }

    try {
      setLocalUpvotes(newUp)
      setLocalDownvotes(newDown)
      setUserVote(newVote)

      const updates: any = {}
      if (newUp !== oldUp) updates.upvote_count = newUp
      if (newDown !== oldDown) updates.downvote_count = newDown

      if (Object.keys(updates).length > 0) {
        await updateThreadCounts(thread.id, updates)
      }
    } catch (error: any) {
      toast.error("Failed to vote: " + error.message)
      setLocalUpvotes(oldUp)
      setLocalDownvotes(oldDown)
      setUserVote(oldVote)
    }
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          open()
        }
      }}
      className="cursor-pointer overflow-hidden p-0 transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CardContent className="p-3">
        <h2 className="truncate text-sm font-semibold text-primary">{thread.title}</h2>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{authorName || "unknown"}</p>

        {categoryLabel && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-[10px]">
              {categoryLabel}
            </Badge>
          </div>
        )}

        {hasImages && (
          <div className="relative mt-3 w-full aspect-video overflow-hidden rounded-md border border-secondary/30">
            <Image
              src={thread.image_urls![0]}
              alt={thread.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
            {thread.image_urls!.length > 1 && (
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                <ImageIcon className="h-3 w-3" />
                +{thread.image_urls!.length - 1}
              </div>
            )}
            {categoryLabel?.toLowerCase() === "buy and sell" && thread.image_prices?.[0] !== undefined && (
              <div className="absolute top-4 right-4 bg-[#3b82f6] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                ₱{thread.image_prices[0]}
              </div>
            )}
          </div>
        )}

        {categoryLabel?.toLowerCase() === "buy and sell" && (
          <div className="mt-3 space-y-3">
            {thread.rfs && (
              <div className="rounded-lg bg-[#eef5ff] border-l-4 border-[#3b82f6] p-3 shadow-sm">
                <h3 className="text-[9px] font-bold uppercase tracking-wider text-[#3b82f6] mb-0.5">
                  REASON FOR SELLING (RFS)
                </h3>
                <p className="text-xs font-medium text-gray-700 truncate">
                  {thread.rfs}
                </p>
              </div>
            )}
            <Button
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white h-10 font-bold shadow-md transition-all active:scale-[0.98] rounded-xl text-xs"
              onClick={(e) => {
                e.stopPropagation()
                toast.info("Sending offer...")
              }}
            >
              Send Offer
            </Button>
          </div>
        )}

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <button
            type="button"
            className="inline-flex items-center gap-1 hover:text-primary transition-colors transition-all active:scale-110"
            onClick={(e) => {
              e.stopPropagation()
              handleVote("up")
            }}
          >
            <ThumbsUp className={`h-3.5 w-3.5 ${userVote === "up" ? "text-primary fill-primary" : ""}`} />
            {formatCount(localUpvotes)}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 hover:text-destructive transition-colors transition-all active:scale-110"
            onClick={(e) => {
              e.stopPropagation()
              handleVote("down")
            }}
          >
            <ThumbsDown className={`h-3.5 w-3.5 ${userVote === "down" ? "text-destructive fill-destructive" : ""}`} />
            {formatCount(localDownvotes)}
          </button>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {formatCount(commentCount)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
