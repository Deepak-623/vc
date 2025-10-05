"use client"

import { useState, useEffect, useRef } from "react"
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
  const [isMuted, setIsMuted] = useState(true) // Start muted by default
  const [roomCode, setRoomCode] = useState("UYVUK77IUIUB")
  const [copied, setCopied] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [micPermissionGranted, setMicPermissionGranted] = useState(false) // Track mic permission
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const username = localStorage.getItem("username") || "Guest"
    const profilePicture = localStorage.getItem("profilePicture") || ""

    const currentUser: Participant = {
      id: "1",
      username,
      profilePicture,
      isSpeaking: false,
      isMuted: true,
    }

    setParticipants([currentUser])

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
  }, [])

  const detectAudioLevel = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length

    // Update speaking state based on volume threshold
    const isSpeaking = average > 20 // Adjust threshold as needed

    setParticipants((prev) => prev.map((p, i) => (i === 0 ? { ...p, isSpeaking: !isMuted && isSpeaking } : p)))

    animationFrameRef.current = requestAnimationFrame(detectAudioLevel)
  }

  const requestMicrophonePermission = async () => {
    if (micPermissionGranted) return true

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = stream
      setMicPermissionGranted(true)

      // Set up audio analysis
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      // Start detecting audio levels
      detectAudioLevel()

      return true
    } catch (error) {
      console.error("Microphone permission denied:", error)
      return false
    }
  }

  const toggleMute = async () => {
    if (isMuted && !micPermissionGranted) {
      const granted = await requestMicrophonePermission()
      if (!granted) {
        alert("Microphone permission is required to unmute")
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
