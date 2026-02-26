// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export function ProfileCard() {
    const router = useRouter()
    const [username, setUsername] = useState("Name")
    const [avatarUrl, setAvatarUrl] = useState("")

    useEffect(() => {
        const supabase = createClient()

        const fetchProfile = async () => {
            const { data: authData } = await supabase.auth.getUser()
            if (!authData?.user) return

            const { data: profile } = await supabase
                .from("profiles")
                .select("username, avatar_url")
                .eq("user_id", authData.user.id)
                .single()

            if (profile) {
                if (profile.username) setUsername(profile.username)
                if (profile.avatar_url) setAvatarUrl(profile.avatar_url)
            }
        }

        fetchProfile()

        window.addEventListener("profile:created", fetchProfile)
        return () => window.removeEventListener("profile:created", fetchProfile)
    }, [])

    const handleLogout = async (e) => {
        e.stopPropagation() // prevent card click from firing
        const supabase = createClient()
        const { error } = await supabase.auth.signOut()
        if (error) {
            toast.error(error.message)
        } else {
            router.push("/")
        }
    }

    return (
        <Card className="rounded-2xl border-2 border-slate-200 shadow-sm">
            <CardContent className="py-2 px-3 flex flex-row items-center gap-3">
                <Avatar className="h-9 w-9 border-2 border-slate-200 shrink-0">
                    <AvatarImage src={avatarUrl} alt={username} />
                    <AvatarFallback>
                        <User className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm text-slate-800 leading-tight break-words min-w-0 flex-1">
                    {username}
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8"
                    title="Log out"
                >
                    <LogOut className="h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
    )
}
