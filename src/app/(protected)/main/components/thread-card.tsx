import React from "react"
import { MessageCircle, ThumbsDown, ThumbsUp, ImageIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

function formatCount(n: number) {
  if (!n) return "0"
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)
}

type ThreadCardProps = {
  thread: { id: string; title: string; content: string; image_urls?: string[] }
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
  const hasImages = thread.image_urls && thread.image_urls.length > 0

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
      className="cursor-pointer transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex overflow-hidden"
    >
      {hasImages && (
        <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 border-r border-[#3e3f40]">
          <Image
            src={thread.image_urls![0]}
            alt={thread.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardContent className="p-3 flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold truncate text-primary">{thread.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {authorName || "unknown"}
            </p>
          </div>
          {hasImages && thread.image_urls!.length > 1 && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary/30 px-1.5 py-0.5 rounded">
              <ImageIcon className="w-3 h-3" />
              +{thread.image_urls!.length - 1}
            </div>
          )}
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
