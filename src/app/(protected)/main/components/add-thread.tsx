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
import { MessageSquare, BarChart2, HelpCircle, Pencil } from "lucide-react"
import { useCategories } from "@/lib/use-categories"

export function AddThread() {
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const { categories, loading: loadingCategories } = useCategories()
  const [categoryId, setCategoryId] = React.useState("")

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    const cleanTitle = title.trim()
    const cleanContent = content.trim()

    if (!cleanTitle || !cleanContent) {
      toast.error("Title and content are required.")
      return
    }

    if (!categoryId) {
      toast.error("Please select a category.")
      return
    }

    setSubmitting(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData?.user) {
        toast.error("You must be logged in.")
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", authData.user.id)
        .single()

      if (profileError || !profile?.id) {
        toast.error("Profile not found.")
        return
      }

      const { error: insertError } = await supabase.from("threads").insert({
        title: cleanTitle,
        content: cleanContent,
        author_id: profile.id,
        category_id: categoryId,
      })

      if (insertError) {
        toast.error(insertError.message)
        return
      }

      toast.success("Thread created successfully!")
      setTitle("")
      setContent("")
      setCategoryId("")
      setOpen(false)
      window.dispatchEvent(new Event("thread:created"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Thread</Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl p-0 overflow-hidden border-none bg-[#18191a] text-gray-200">
        <DialogHeader className="bg-[#222324] px-4 py-3 border-b border-[#3e3f40]">
          <DialogTitle className="text-xl font-normal">Post thread</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Title Section */}
          <div className="p-4 bg-[#2c2d2e] border-b border-[#3e3f40]">
            <Input
              id="title"
              placeholder="Please enter the title of your thread or discussion here."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={submitting}
              className="bg-[#18191a] border-[#3e3f40] h-12 text-lg focus-visible:ring-1 focus-visible:ring-blue-500 placeholder:text-gray-500"
            />
          </div>

          {/* Content Area - Using Native Textarea to avoid import errors */}
          <div className="bg-[#18191a]">
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={submitting}
              placeholder="Write your discussion here..."
              className="flex min-h-[300px] w-full border-x-0 border-t-0 border-b border-[#3e3f40] bg-[#18191a] px-4 py-3 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-0 resize-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Category/Tags Footer */}
          <div className="bg-[#222324] p-4 border-t border-[#3e3f40] space-y-4">
            <div className="flex items-center gap-4">
              <label htmlFor="category" className="text-sm font-medium text-gray-400 w-12 text-right">
                Tags:
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={submitting || loadingCategories}
                className="flex-1 h-9 rounded-sm border border-[#3e3f40] bg-[#18191a] px-3 py-1 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">{loadingCategories ? "Loading..." : "Select a category"}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Footer */}
          <div className="bg-[#2c2d2e] p-4 flex justify-center border-t border-[#3e3f40]">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#2577b1] hover:bg-[#2a88ca] text-white px-6 py-2 h-auto flex gap-2"
            >
              <Pencil className="w-4 h-4" />
              {submitting ? "Creating..." : "Post thread"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}