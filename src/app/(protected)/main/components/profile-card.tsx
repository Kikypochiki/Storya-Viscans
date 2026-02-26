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
    <div className="space-y-3">
      <div className="px-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Account
        </p>
      </div>

      <Card className="rounded-xl border border-primary/20 bg-card/95 text-card-foreground shadow-sm backdrop-blur">
        <CardContent className="px-3 py-3 flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0 ring-2 ring-secondary/60">
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight truncate text-primary">
              {username}
            </p>
            <p className="text-xs text-secondary-foreground/80 truncate">Profile</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogoutClick}
            className="h-8 w-8 shrink-0 rounded-md text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {showLogoutAlert && (
        <Alert className="border-primary/20 bg-secondary/30">
          <AlertTitle className="text-primary">Log out?</AlertTitle>
          <AlertDescription className="text-secondary-foreground/90">
            You’ll be signed out of your account.
          </AlertDescription>
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" variant="destructive" onClick={confirmLogout}>
              Yes, log out
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-secondary bg-secondary/40 text-secondary-foreground hover:bg-secondary"
              onClick={() => setShowLogoutAlert(false)}
            >
              Cancel
            </Button>
          </div>
        </Alert>
      )}

      {logoutError && (
        <Alert variant="destructive" className="border-destructive/70">
          <AlertTitle>Logout failed</AlertTitle>
          <AlertDescription>{logoutError}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
