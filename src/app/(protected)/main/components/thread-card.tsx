import React, { useEffect, useRef, useState } from "react"
import { MessageCircle, ThumbsDown, ThumbsUp, ImageIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

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
    category_name?: string | null
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

  const open = () => onOpen?.(thread.id)
  const hasImages = !!thread.image_urls?.length

  const category =
    thread.category_id != null
      ? categories.find((c) => String(c.id) === String(thread.category_id))
      : undefined

  const categoryLabel = thread.category_name || category?.name || null

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
        <h1 className="truncate text-xl font-semibold text-primary">{thread.title}</h1>
        <div className="mt-0.5 flex items-center  gap-2">
          <p className="truncate text-xs text-muted-foreground">by {authorName || "unknown"}</p>
          {categoryLabel && (
            <Badge
              variant="secondary"
              className="inline-flex h-5 items-center rounded-full px-2.5 text-[10px] font-medium tracking-wide text-secondary-foreground bg-secondary/70 border border-border/60 flex-shrink-0"
            >
              {categoryLabel}
            </Badge>
          )}
        </div>

        {hasImages && (
          <div className="relative mt-3 w-full aspect-video overflow-hidden rounded-md border border-[#3e3f40]">
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
              <div className="absolute bottom-2 left-2 bg-green-600/90 text-white px-2 py-1 rounded text-xs font-bold shadow-md">
                ₱{thread.image_prices[0]}
              </div>
            )}
          </div>
        )}

        {categoryLabel?.toLowerCase() === "buy and sell" && (
          <Button
            size="sm"
            className="w-full mt-3 bg-primary text-white h-8 text-xs transition-all active:scale-95"
            onClick={(e) => {
              e.stopPropagation()
              toast.info("Sending offer feature coming soon!")
            }}
          >
            Send Offer
          </Button>
        )}

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" />
            {formatCount(upvotes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <ThumbsDown className="h-3.5 w-3.5" />
            {formatCount(downvotes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {formatCount(commentCount)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
