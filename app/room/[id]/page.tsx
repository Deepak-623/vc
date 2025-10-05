"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, PhoneOff, Copy, Check } from "lucide-react"
import ParticipantTile from "@/components/participant-tile"

interface Participant {
  id: string
  username: string
  profilePicture?: string
  isSpeaking: boolean
  isMuted: boolean
}

export default function VoiceChatRoom({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isMuted, setIsMuted] = useState(false)
  const [roomCode, setRoomCode] = useState("UYVUK77IUIUB")
  const [copied, setCopied] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])

  useEffect(() => {
    // Get username from localStorage
    const username = localStorage.getItem("username") || "Guest"
    const profilePicture = localStorage.getItem("profilePicture") || ""

    // Initialize with current user
    const currentUser: Participant = {
      id: "1",
      username,
      profilePicture,
      isSpeaking: false,
      isMuted: false,
    }

    // Add some demo participants with staggered animations
    setTimeout(() => {
      setParticipants([currentUser])
    }, 100)

    setTimeout(() => {
      setParticipants((prev) => [
        ...prev,
        {
          id: "2",
          username: "Sarah Chen",
          profilePicture: "/professional-woman-avatar.png",
          isSpeaking: false,
          isMuted: false,
        },
      ])
    }, 600)

    setTimeout(() => {
      setParticipants((prev) => [
        ...prev,
        {
          id: "3",
          username: "Mike Johnson",
          profilePicture: "/professional-man-avatar.png",
          isSpeaking: true,
          isMuted: false,
        },
      ])
    }, 1100)

    // Simulate random speaking
    const interval = setInterval(() => {
      setParticipants((prev) =>
        prev.map((p) => ({
          ...p,
          isSpeaking: Math.random() > 0.7,
        })),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const toggleMute = () => {
    setIsMuted(!isMuted)
    setParticipants((prev) => prev.map((p, i) => (i === 0 ? { ...p, isMuted: !isMuted } : p)))
  }

  const handleLeaveRoom = () => {
    router.push("/")
  }

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-foreground">Voice Room</h1>
              <button
                onClick={copyRoomCode}
                className="flex items-center gap-2 px-3 py-1.5 bg-accent rounded-lg border border-border hover:bg-accent/80 transition-all duration-200 hover:scale-105 active:scale-95 group"
              >
                <span className="text-sm font-mono font-semibold text-primary">{roomCode}</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                )}
              </button>
            </div>
            <Button
              onClick={handleLeaveRoom}
              variant="destructive"
              className="transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              Leave Room
            </Button>
          </div>
        </div>
      </div>

      {/* Participants Grid */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {participants.map((participant, index) => (
              <ParticipantTile key={participant.id} participant={participant} delay={index * 0.1} />
            ))}
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 4 - participants.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="aspect-video rounded-2xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center animate-fade-in"
                style={{ animationDelay: `${(participants.length + i) * 0.1}s` }}
              >
                <p className="text-sm text-muted-foreground">Waiting for participant...</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center">
            <Button
              onClick={toggleMute}
              size="lg"
              variant={isMuted ? "destructive" : "default"}
              className="h-14 px-8 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            >
              {isMuted ? (
                <>
                  <MicOff className="w-5 h-5 mr-2" />
                  Unmute
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Mute
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
