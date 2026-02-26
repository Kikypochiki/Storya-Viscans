"use client"

import React from "react"
import { MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

function formatCount(n: number) {
  if (!n) return "0"
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)
}

type ThreadCardProps = {
  thread: { id: string; title: string; content: string }
  onOpen?: (id: string) => void
  upvotes?: number
  downvotes?: number
  comments?: number
  authorName?: string
}

export function ThreadCard({
  thread,
  onOpen,
  upvotes = 0,
  downvotes = 0,
  comments = 0,
  authorName,
}: ThreadCardProps) {
  const open = () => onOpen?.(thread.id)

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
      className="cursor-pointer transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CardContent className="p-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold truncate">{thread.title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {authorName || "unknown"}
          </p>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
          {thread.content}
        </p>

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
            {formatCount(comments)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}