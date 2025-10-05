"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Video } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePicture(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleCreateRoom = () => {
    if (username.trim()) {
      localStorage.setItem("username", username)
      if (previewUrl) localStorage.setItem("profilePicture", previewUrl)
      router.push("/create-room")
    }
  }

  const handleJoinRoom = () => {
    if (username.trim()) {
      localStorage.setItem("username", username)
      if (previewUrl) localStorage.setItem("profilePicture", previewUrl)
      router.push("/join-room")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Video className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">VoiceHub</h1>
        </div>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-md shadow-lg border-border animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-balance">Welcome to VoiceHub</CardTitle>
          <CardDescription className="text-base">Set up your profile to get started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Username Input */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Display Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Profile Picture Upload */}
          <div className="space-y-2">
            <Label htmlFor="profile-picture" className="text-sm font-medium">
              Profile Picture
            </Label>
            <div className="flex items-center gap-4">
              {previewUrl ? (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary transition-all duration-300">
                  <img src={previewUrl || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border transition-all duration-300">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <label htmlFor="profile-picture" className="flex-1">
                <div className="cursor-pointer px-4 py-2.5 border-2 border-border rounded-lg hover:border-primary hover:bg-accent transition-all duration-200 text-center text-sm font-medium">
                  Choose File
                </div>
                <input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleCreateRoom}
              disabled={!username.trim()}
              className="w-full h-12 text-base font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Create Room
            </Button>
            <Button
              onClick={handleJoinRoom}
              disabled={!username.trim()}
              variant="outline"
              className="w-full h-12 text-base font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-transparent"
            >
              Join Room
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
        Premium voice chat for teams
      </p>
    </div>
  )
}
