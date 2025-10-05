"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, PhoneOff, Copy, Check, Loader2 } from "lucide-react"
import ParticipantTile from "@/components/participant-tile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Participant {
  id: string
  username: string
  profilePicture?: string
  isSpeaking: boolean
  isMuted: boolean
}

export default function VoiceChatRoom() {
  const router = useRouter()
  const params = useParams()
  const roomId = params.id as string
  const [isMuted, setIsMuted] = useState(true)
  const [roomCode, setRoomCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [micPermissionGranted, setMicPermissionGranted] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [roomError, setRoomError] = useState("")
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const username = localStorage.getItem("username")
    if (!username) {
      router.push("/")
      return
    }

    validateRoom()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [router, roomId])

  const validateRoom = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
      const response = await fetch(`${backendUrl}/api/room/${roomId}`)

      if (!response.ok) {
        setRoomError("Room not found. Please check the room link or code.")
        setIsValidating(false)
        return
      }

      const data = await response.json()
      setRoomCode(data.joinCode)

      const username = localStorage.getItem("username")
      const profilePicture = localStorage.getItem("profilePicture") || ""

      const currentUser: Participant = {
        id: "1",
        username: username || "User",
        profilePicture,
        isSpeaking: false,
        isMuted: true,
      }

      setParticipants([currentUser])
      setIsValidating(false)
    } catch (err) {
      console.error("[v0] Error validating room:", err)
      setRoomError("Failed to connect to server. Please check if the backend is running.")
      setIsValidating(false)
    }
  }

  const detectAudioLevel = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
    const isSpeaking = average > 20

    setParticipants((prev) => prev.map((p, i) => (i === 0 ? { ...p, isSpeaking: !isMuted && isSpeaking } : p)))

    animationFrameRef.current = requestAnimationFrame(detectAudioLevel)
  }

  const requestMicrophonePermission = async () => {
    if (micPermissionGranted) return true

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      micStreamRef.current = stream
      setMicPermissionGranted(true)

      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      detectAudioLevel()

      return true
    } catch (error) {
      console.error("[v0] Microphone permission denied:", error)
      if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
        alert("Microphone access requires HTTPS. Please use a secure connection.")
      } else {
        alert("Microphone permission is required to unmute. Please allow microphone access in your browser settings.")
      }
      return false
    }
  }

  const toggleMute = async () => {
    if (isMuted && !micPermissionGranted) {
      const granted = await requestMicrophonePermission()
      if (!granted) {
        return
      }
    }

    setIsMuted(!isMuted)
    setParticipants((prev) => prev.map((p, i) => (i === 0 ? { ...p, isMuted: !isMuted, isSpeaking: false } : p)))

    if (!isMuted) {
      setParticipants((prev) => prev.map((p, i) => (i === 0 ? { ...p, isSpeaking: false } : p)))
    }
  }

  const handleLeaveRoom = () => {
    router.push("/")
  }

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isValidating) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Joining room...</p>
        </div>
      </div>
    )
  }

  if (roomError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Room Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{roomError}</p>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/join-room")} variant="outline" className="flex-1">
                Try Another Code
              </Button>
              <Button onClick={() => router.push("/")} className="flex-1">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-foreground">Voice Room</h1>
              {roomCode && (
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
              )}
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
