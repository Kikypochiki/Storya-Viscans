// @ts-nocheck
"use client"

import React, { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ProfileEditDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ProfileEditDialog({ open, onOpenChange }: ProfileEditDialogProps) {
    const [username, setUsername] = useState("")
    const [bio, setBio] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [avatarUrl, setAvatarUrl] = useState("")
    const [preview, setPreview] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)

    // Load existing profile when dialog opens
    useEffect(() => {
        if (!open) return

        const load = async () => {
            setLoading(true)
            const supabase = createClient()
            const { data: authData } = await supabase.auth.getUser()
            if (!authData?.user) { setLoading(false); return }

            const { data: profile } = await supabase
                .from("profiles")
                .select("username, bio, avatar_url")
                .eq("user_id", authData.user.id)
                .single()

            if (profile) {
                setUsername(profile.username || "")
                setBio(profile.bio || "")
                setAvatarUrl(profile.avatar_url || "")
                setPreview(profile.avatar_url || "")
            }
            setImageFile(null)
            setLoading(false)
        }

        load()
    }, [open])

    // Live image preview
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        setImageFile(file)
        if (file) {
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (submitting) return

        const cleanUsername = username.trim()
        if (!cleanUsername) {
            toast.error("Username is required.")
            return
        }

        setSubmitting(true)
        try {
            const supabase = createClient()
            const { data: authData } = await supabase.auth.getUser()
            if (!authData?.user) { toast.error("You must be logged in."); return }

            const userId = authData.user.id
            let newAvatarUrl = avatarUrl

            if (imageFile) {
                const fileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
                const filePath = `profiles/${userId}/${fileName}`

                // Cleanup all old profile images before uploading the new one
                try {
                    const { data: oldFiles } = await supabase.storage.from("profile_image").list(`profiles/${userId}`)
                    if (oldFiles && oldFiles.length > 0) {
                        const filesToRemove = oldFiles
                            .filter((f) => f.name !== fileName)
                            .map((f) => `profiles/${userId}/${f.name}`)

                        if (filesToRemove.length > 0) {
                            await supabase.storage.from("profile_image").remove(filesToRemove)
                        }
                    }
                } catch (err) {
                    console.error("Failed to cleanup old profile images:", err)
                }

                const { error: uploadError } = await supabase.storage
                    .from("profile_image")
                    .upload(filePath, imageFile, { upsert: true, contentType: imageFile.type || "image/jpeg" })

                if (uploadError) { toast.error(uploadError.message); return }

                const { data: publicData } = supabase.storage.from("profile_image").getPublicUrl(filePath)
                newAvatarUrl = `${publicData.publicUrl}?t=${Date.now()}`
            }

            const { error } = await supabase.from("profiles").upsert(
                { user_id: userId, username: cleanUsername, bio: bio.trim(), avatar_url: newAvatarUrl },
                { onConflict: "user_id" }
            )

            if (error) { toast.error(error.message); return }

            toast.success("Profile updated!")
            setImageFile(null)
            window.dispatchEvent(new Event("profile:created"))
            onOpenChange(false)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Edit Profile</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">

                        {/* Avatar preview */}
                        <div className="flex flex-col items-center gap-2">
                            <Avatar className="h-20 w-20 border-2 border-border">
                                <AvatarImage src={preview} alt={username} />
                                <AvatarFallback>
                                    <User className="h-8 w-8" />
                                </AvatarFallback>
                            </Avatar>
                            <label className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                                Change photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={submitting}
                                />
                            </label>
                        </div>

                        {/* Username */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium">Username</label>
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                disabled={submitting}
                                required
                            />
                        </div>

                        {/* Bio */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium">Bio</label>
                            <Input
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell people about yourself"
                                disabled={submitting}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-1">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => onOpenChange(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={submitting}>
                                {submitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
