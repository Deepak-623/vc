"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, Video, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function CreateRoomPage() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState("")
  const [roomLink, setRoomLink] = useState("")
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [roomId, setRoomId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const username = localStorage.getItem("username")
    if (!username) {
      router.push("/")
      return
    }

    createRoomOnBackend()
  }, [router])

  const createRoomOnBackend = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
      const response = await fetch(`${backendUrl}/api/create-room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to create room")
      }

      const data = await response.json()
      setRoomCode(data.joinCode)
      setRoomId(data.roomId)

      const link = `${window.location.origin}/room/${data.roomId}`
      setRoomLink(link)
      setIsLoading(false)
    } catch (err) {
      console.error("[v0] Error creating room:", err)
      setError("Failed to create room. Please check if the backend server is running.")
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: "link" | "code") => {
    await navigator.clipboard.writeText(text)
    if (type === "link") {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } else {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const handleEnterRoom = () => {
    router.push(`/room/${roomId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Creating your room...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => router.push("/")} className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Video className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">VoiceHub</h1>
        </div>
      </div>

      <Card className="w-full max-w-2xl shadow-lg border-border animate-slide-in">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-balance">Room Created Successfully!</CardTitle>
          <CardDescription className="text-base">Share the link or code with others to invite them</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <label className="text-sm font-medium text-foreground">Room Link</label>
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-3 bg-muted rounded-lg border border-border text-sm font-mono text-foreground break-all">
                {roomLink}
              </div>
              <Button
                onClick={() => copyToClipboard(roomLink, "link")}
                variant="outline"
                size="icon"
                className="h-auto px-4 border-2 hover:bg-accent transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {copiedLink ? <Check className="w-5 h-5 text-primary" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <label className="text-sm font-medium text-foreground">Room Code</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center justify-center px-6 py-4 bg-accent rounded-xl border-2 border-primary/20">
                <span className="text-2xl font-bold text-primary tracking-wider font-mono">{roomCode}</span>
              </div>
              <Button
                onClick={() => copyToClipboard(roomCode, "code")}
                variant="outline"
                size="icon"
                className="h-auto px-4 py-4 border-2 hover:bg-accent transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {copiedCode ? <Check className="w-5 h-5 text-primary" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <div className="pt-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button
              onClick={handleEnterRoom}
              className="w-full h-12 text-base font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Enter Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
