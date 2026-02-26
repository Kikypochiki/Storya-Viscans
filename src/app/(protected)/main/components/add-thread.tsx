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

export function AddThread() {
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const [categories, setCategories] = React.useState<Array<{ id: string; name: string }>>([])
  const [categoryId, setCategoryId] = React.useState("")
  const [loadingCategories, setLoadingCategories] = React.useState(false)

  const supabase = createClient()

  React.useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true)
      const { data, error } = await supabase
        .from("categories")
        .select("id,name")
        .order("name", { ascending: true })

      if (error) {
        toast.error(error.message)
      } else {
        setCategories((data as Array<{ id: string; name: string }>) || [])
      }
      setLoadingCategories(false)
    }

    loadCategories()
  }, [supabase])

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
        .eq("user_id", authData.user.id)
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

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new thread</DialogTitle>
          <DialogDescription>Fill in the details to create a new thread</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid w-full items-center gap-4 py-4">
          <div className="grid w-full items-center gap-2">
            <label htmlFor="title" className="text-sm font-medium leading-6">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <label htmlFor="content" className="text-sm font-medium leading-6">
              Content
            </label>
            <Input
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <label htmlFor="category" className="text-sm font-medium leading-6">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={submitting || loadingCategories}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
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

          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Thread"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}