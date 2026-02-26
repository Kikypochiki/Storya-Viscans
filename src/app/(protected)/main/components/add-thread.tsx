"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Pencil, ImagePlus, Plus, X } from "lucide-react"
import { useCategories } from "@/lib/use-categories"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AddThread() {
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [imageFiles, setImageFiles] = React.useState<File[]>([])
  const [previews, setPreviews] = React.useState<string[]>([])
  const [imagePrices, setImagePrices] = React.useState<string[]>([])
  const [rfs, setRfs] = React.useState("")

  const { categories, loading: loadingCategories } = useCategories()
  const [categoryId, setCategoryId] = React.useState("")

  const supabase = createClient()

  const selectedCategory = React.useMemo(
    () => categories.find((c) => String(c.id) === String(categoryId)),
    [categories, categoryId]
  )
  const isBuySell = selectedCategory?.name?.toLowerCase() === "buy and sell"

  React.useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setImageFiles((prev) => [...prev, ...files])
    setPreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))])
    setImagePrices((prev) => [...prev, ...files.map(() => "")])

    // reset input so same file can be re-picked
    e.target.value = ""
  }

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => {
      const next = prev.filter((_, i) => i !== index)
      URL.revokeObjectURL(prev[index])
      return next
    })
    setImagePrices((prev) => prev.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setTitle("")
    setContent("")
    setCategoryId("")
    setImageFiles([])
    previews.forEach((url) => URL.revokeObjectURL(url))
    setPreviews([])
    setImagePrices([])
    setRfs("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    const cleanTitle = title.trim()
    const cleanContent = content.replace(/\r\n?/g, "\n").trim()

    if (!cleanTitle || !cleanContent) {
      toast.error("Title and content are required.")
      return
    }

    if (!categoryId) {
      toast.error("Please select a category.")
      return
    }

    if (isBuySell) {
      if (imageFiles.length === 0) {
        toast.error("At least one picture is required for Buy and Sell.")
        return
      }
      if (!rfs.trim()) {
        toast.error("Reason for Selling (RFS) is mandatory for Buy and Sell.")
        return
      }
      if (imagePrices.some((p) => !p.trim())) {
        toast.error("Please provide a price for each picture.")
        return
      }
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

      const uploadedUrls: string[] = []
      for (const file of imageFiles) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
        const filePath = `threads/${authData.user.id}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from("thread_images")
          .upload(filePath, file, {
            upsert: true,
            contentType: file.type || "image/jpeg",
          })

        if (uploadError) {
          toast.error(`Error uploading image: ${uploadError.message}`)
          continue
        }

        const { data: publicData } = supabase.storage.from("thread_images").getPublicUrl(filePath)
        uploadedUrls.push(publicData.publicUrl)
      }

      const { error: insertError } = await supabase.from("threads").insert({
        title: cleanTitle,
        content: cleanContent,
        author_id: profile.id,
        category_id: categoryId,
        image_urls: uploadedUrls,
        image_prices: isBuySell ? imagePrices.map((p) => parseFloat(p)) : null,
        rfs: isBuySell ? rfs : null,
      })

      if (insertError) {
        toast.error(insertError.message)
        return
      }

      toast.success("Thread created successfully!")
      resetForm()
      setOpen(false)
      window.dispatchEvent(new Event("thread:created"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next && !submitting) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="inline-flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary">
          <Plus className="h-4 w-4" />
          <span>Add Thread</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-base md:text-lg font-semibold text-primary">Create thread</DialogTitle>
          <p className="text-xs text-muted-foreground">Share a topic, attach images, and post to a category.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex max-h-[85vh] flex-col">
          <div className="overflow-y-auto px-5 py-5 md:px-6 md:py-6 space-y-5">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                placeholder="Enter thread title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={submitting}
                placeholder="Write your discussion..."
                className="min-h-[180px] resize-y leading-6"
                wrap="hard"
                cols={80}
              />
            </div>

            {isBuySell && (
              <div className="space-y-2 rounded-md border bg-card p-3">
                <label htmlFor="rfs" className="text-sm font-medium">
                  Reason for Selling (RFS)
                </label>
                <Textarea
                  id="rfs"
                  value={rfs}
                  onChange={(e) => setRfs(e.target.value)}
                  placeholder="Explain why you are selling this item..."
                  className="min-h-[100px]"
                  required
                  disabled={submitting}
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                disabled={submitting || loadingCategories}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue
                    placeholder={loadingCategories ? "Loading..." : "Select a category"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Images</p>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {previews.map((preview, index) => (
                  <div key={index} className="space-y-1">
                    <div className="relative aspect-square rounded-md overflow-hidden border bg-muted">
                      <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 rounded-full bg-background/85 border p-1 text-foreground"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {isBuySell && (
                      <Input
                        type="number"
                        placeholder="Price"
                        value={imagePrices[index] ?? ""}
                        onChange={(e) => {
                          const val = e.target.value
                          if (/^\d*\.?\d*$/.test(val) || val === "") {
                            const next = [...imagePrices]
                            next[index] = val
                            setImagePrices(next)
                          }
                        }}
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault()
                        }}
                        className="h-8 text-xs"
                      />
                    )}
                  </div>
                ))}

                <label className="aspect-square rounded-md border-2 border-dashed bg-muted/40 flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                  <ImagePlus className="w-5 h-5" />
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
          </div>

          <div className="border-t px-5 py-4 md:px-6 flex items-center justify-end gap-2 bg-background">
            <Button
              type="button"
              variant="ghost"
              disabled={submitting}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="min-w-28">
              <Pencil className="w-4 h-4 mr-1" />
              {submitting ? "Creating..." : "Post Thread"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
