"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function JoinRoomPage() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const username = localStorage.getItem("username")
    if (!username) {
      router.push("/")
    }
  }, [router])

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      setError("Please enter a room code")
      return
    }

    if (roomCode.length !== 12) {
      setError("Room code must be 12 characters")
      return
    }

    const roomId = Array.from({ length: 16 }, () => "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]).join(
      "",
    )

    router.push(`/room/${roomId}?code=${roomCode}`)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
    setRoomCode(value)
    if (error) setError("")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-md mb-8">
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
      <Card className="w-full max-w-md shadow-lg border-border animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-balance">Join a Room</CardTitle>
          <CardDescription className="text-base">Enter the room code to join the conversation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Room Code Input */}
          <div className="space-y-2">
            <label htmlFor="room-code" className="text-sm font-medium text-foreground">
              Room Code
            </label>
            <Input
              id="room-code"
              type="text"
              placeholder="Enter 12-character code"
              value={roomCode}
              onChange={handleInputChange}
              maxLength={12}
              className="h-12 text-center text-lg font-mono tracking-wider transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
            />
            {error && <p className="text-sm text-destructive animate-fade-in">{error}</p>}
          </div>

          {/* Join Button */}
          <div className="pt-2">
            <Button
              onClick={handleJoinRoom}
              disabled={!roomCode.trim()}
              className="w-full h-12 text-base font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Join Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
