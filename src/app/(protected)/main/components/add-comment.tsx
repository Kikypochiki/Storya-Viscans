"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { MessageSquare } from "lucide-react"

export function AddComment({
  threadId,
}: {
  threadId: string
}) {
  const [open, setOpen] = React.useState(false)
  const [content, setContent] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast.error("Comment cannot be empty.")
      return
    }

    setSubmitting(true)

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

      const { error } = await supabase.from("comments").insert({
        content: content.trim(),
        thread_id: threadId,
        author_id: profileRow.id,
      })

      if (error) {
        toast.error("Failed to add comment: " + error.message)
      } else {
        toast.success("Comment added!")
        setContent("")
        setOpen(false)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="mr-2" size={16} />
          Add Comment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Comment</DialogTitle>
          <DialogDescription>
            Share your thoughts on this thread.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your comment here..."
            required
            disabled={submitting}
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Comment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
