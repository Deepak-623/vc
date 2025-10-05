"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, Video, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateRoomPage() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState("")
  const [roomLink, setRoomLink] = useState("")
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  useEffect(() => {
    // Generate random room code
    const code = generateRoomCode()
    setRoomCode(code)

    // Generate room link
    const link = `${window.location.origin}/room/${generateRoomId()}?JOIN=${code}`
    setRoomLink(link)
  }, [])

  const generateRoomCode = () => {
    return Array.from(
      { length: 12 },
      () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)],
    ).join("")
  }

  const generateRoomId = () => {
    return Array.from({ length: 16 }, () => "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]).join("")
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
    router.push(`/room/${generateRoomId()}?code=${roomCode}`)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-2xl mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

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
      <Card className="w-full max-w-2xl shadow-lg border-border animate-slide-in">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-balance">Room Created Successfully!</CardTitle>
          <CardDescription className="text-base">Share the link or code with others to invite them</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Room Link */}
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

          {/* Room Code */}
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

          {/* Enter Room Button */}
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
