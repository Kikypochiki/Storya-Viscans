"use client"
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
import React from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export function AddThread() {
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
            toast.error("You must be logged in.");
            return;
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", authData.user.id)
            .single();

        if (profileError || !profile) {
            toast.error("Profile not found.");
            return;
        }

        const { error } = await supabase.from("threads").insert({
            title,
            content,
            profile_id: profile.id, 
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Thread created successfully!");
            setOpen(false);
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
                    <DialogDescription>
                        Fill in the details to create a new thread
                    </DialogDescription> 
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
                        />
                    </div>
                    <Button type="submit">Create Thread</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
