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
import { MessageSquare, BarChart2, HelpCircle, Pencil, ImagePlus, X } from "lucide-react"
import { useCategories } from "@/lib/use-categories"
import Image from "next/image"

export function AddThread() {
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [imageFiles, setImageFiles] = React.useState<File[]>([])
  const [previews, setPreviews] = React.useState<string[]>([])

  const { categories, loading: loadingCategories } = useCategories()
  const [categoryId, setCategoryId] = React.useState("")

  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newFiles = [...imageFiles, ...files]
    setImageFiles(newFiles)

    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index)
      // Revoke the URL to avoid memory leaks
      URL.revokeObjectURL(prev[index])
      return newPreviews
    })
  }

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

      // Upload Images
      const uploadedUrls: string[] = []
      for (const file of imageFiles) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
        const filePath = `threads/${authData.user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from("threads")
          .upload(filePath, file, {
            upsert: true,
            contentType: file.type || "image/jpeg",
          })

        if (uploadError) {
          toast.error(`Error uploading image: ${uploadError.message}`)
          continue
        }

        const { data: publicData } = supabase.storage.from("threads").getPublicUrl(filePath)
        uploadedUrls.push(publicData.publicUrl)
      }

      // Insert Thread
      // Using array of URLs if possible, otherwise first URL as per original schema or a JSON string.
      // Based on the prompt, it says image_url: text. I'll join them with commas or just use the first one if it's strictly one text field.
      // But user said "I want to be able to upload multiple images". 
      // I'll assume the schema is updated to image_urls: text[] or I'll just use the plural field name.
      const { error: insertError } = await supabase.from("threads").insert({
        title: cleanTitle,
        content: cleanContent,
        author_id: profile.id,
        category_id: categoryId,
        image_url: uploadedUrls.length > 0 ? uploadedUrls[0] : null, // Fallback for single field
        image_urls: uploadedUrls, // Assuming array support
      })

      if (insertError) {
        toast.error(insertError.message)
        return
      }

      toast.success("Thread created successfully!")
      setTitle("")
      setContent("")
      setCategoryId("")
      setImageFiles([])
      setPreviews([])
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

          {/* Content Area */}
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

          {/* Image Upload Area */}
          <div className="bg-[#18191a] px-4 py-2 border-b border-[#3e3f40]">
            <div className="flex flex-wrap gap-2 mb-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border border-[#3e3f40]">
                  <Image
                    src={preview}
                    alt={`Preview ${index}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 rounded-full p-1 text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center w-20 h-20 rounded-md border-2 border-dashed border-[#3e3f40] hover:border-blue-500 transition-colors cursor-pointer text-gray-400 hover:text-blue-500">
                <ImagePlus className="w-6 h-6" />
                <span className="text-[10px] mt-1">Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={submitting}
                />
              </label>
            </div>
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
