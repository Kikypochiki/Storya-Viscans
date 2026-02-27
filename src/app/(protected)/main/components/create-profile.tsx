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

    export function CreateProfileDialog() {
    const supabase = createClient()

    const [open, setOpen] = React.useState(false)
    const [username, setUsername] = React.useState("")
    const [bio, setBio] = React.useState("")
    const [imageFile, setImageFile] = React.useState<File | null>(null)
    const [submitting, setSubmitting] = React.useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (submitting) return

        const cleanUsername = username.trim()
        const cleanBio = bio.trim()

        if (!cleanUsername) {
        toast.error("Username is required.")
        return
        }

        setSubmitting(true)
        try {
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError || !authData?.user) {
            toast.error("You must be logged in.")
            return
        }

        const userId = authData.user.id
        let avatarUrl: string | null = null

        if (imageFile) {
            const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg"
            const filePath = `profiles/${userId}-${Date.now()}.${ext}`

            const { error: uploadError } = await supabase.storage
            .from("profile_image")
            .upload(filePath, imageFile, {
                upsert: true,
                contentType: imageFile.type || "image/jpeg",
            })

            if (uploadError) {
            toast.error(uploadError.message)
            return
            }

            const { data: publicData } = supabase.storage.from("profile_image").getPublicUrl(filePath)
            avatarUrl = publicData.publicUrl
        }

        const { error: profileError } = await supabase.from("profiles").upsert(
            {
            user_id: userId,
            username: cleanUsername,
            avatar_url: avatarUrl,
            bio: cleanBio,
            },
            { onConflict: "user_id" }
        )

        if (profileError) {
            toast.error(profileError.message)
            return
        }

        toast.success("Profile saved.")
        setUsername("")
        setBio("")
        setImageFile(null)
        setOpen(false)
        window.dispatchEvent(new Event("profile:created"))
        } finally {
        setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button className="w-full mt-3">Create Profile</Button>
        </DialogTrigger>

        <DialogContent>
            <DialogHeader>
            <DialogTitle>Create your profile</DialogTitle>
            <DialogDescription>Add a username, bio, and profile image.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="grid gap-4 py-2">
            <div className="grid gap-2">
                <label htmlFor="username" className="text-sm font-medium">
                Username
                </label>
                <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                disabled={submitting}
                required
                />
            </div>

            <div className="grid gap-2">
                <label htmlFor="bio" className="text-sm font-medium">
                Bio
                </label>
                <Input
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people about yourself"
                disabled={submitting}
                />
            </div>

            <div className="grid gap-2">
                <label htmlFor="avatar" className="text-sm font-medium">
                Profile image
                </label>
                <Input
                id="avatar"
                type="file"
                accept="image/*"
                disabled={submitting}
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
            </div>

            <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Profile"}
            </Button>
            </form>
        </DialogContent>
        </Dialog>
    )
    }