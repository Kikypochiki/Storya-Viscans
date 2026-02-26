// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export function ProfileCard() {
  const router = useRouter()
  const [username, setUsername] = useState("Name")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [showLogoutAlert, setShowLogoutAlert] = useState(false)
  const [logoutError, setLogoutError] = useState("")

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

  const handleLogoutClick = (e) => {
    e.stopPropagation()
    setLogoutError("")
    setShowLogoutAlert(true)
  }

  const confirmLogout = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      setLogoutError(error.message)
      return
    }

    setShowLogoutAlert(false)
    router.push("/")
  }

  return (
    <div className="space-y-2">
      <Card className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <CardContent className="px-3 py-2.5 flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0 ring-1 ring-border">
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback className="bg-muted text-muted-foreground">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight truncate">{username}</p>
            <p className="text-xs text-muted-foreground truncate">Profile</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogoutClick}
            className="h-8 w-8 shrink-0 rounded-md text-muted-foreground hover:text-foreground"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {showLogoutAlert && (
        <Alert>
          <AlertTitle>Log out?</AlertTitle>
          <AlertDescription>
            You’ll be signed out of your account.
          </AlertDescription>
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" variant="destructive" onClick={confirmLogout}>
              Yes, log out
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogoutAlert(false)}
            >
              Cancel
            </Button>
          </div>
        </Alert>
      )}

      {logoutError && (
        <Alert variant="destructive">
          <AlertTitle>Logout failed</AlertTitle>
          <AlertDescription>{logoutError}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
