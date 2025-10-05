"use client"

interface Participant {
  id: string
  username: string
  profilePicture?: string
  isSpeaking: boolean
  isMuted: boolean
}

interface ParticipantTileProps {
  participant: Participant
  delay?: number
}

export default function ParticipantTile({ participant, delay = 0 }: ParticipantTileProps) {
  return (
    <div
      className="aspect-video rounded-2xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in relative group"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-6">
        {/* Avatar with speaking indicator */}
        <div className="relative mb-4">
          {/* Speaking ring animation */}
          {participant.isSpeaking && (
            <div className="absolute inset-0 -m-2 rounded-full border-4 border-primary animate-pulse-ring" />
          )}

          {/* Avatar */}
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 transition-all duration-300 ${
              participant.isSpeaking ? "border-primary shadow-lg shadow-primary/20" : "border-border"
            }`}
          >
            {participant.profilePicture ? (
              <img
                src={participant.profilePicture || "/placeholder.svg"}
                alt={participant.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-bold text-primary">
                  {participant.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Muted indicator */}
          {participant.isMuted && (
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-destructive rounded-full flex items-center justify-center border-2 border-card shadow-lg">
              <svg
                className="w-4 h-4 text-destructive-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Username */}
        <h3 className="text-lg sm:text-xl font-semibold text-foreground text-center text-balance">
          {participant.username}
        </h3>

        {/* Speaking indicator text */}
        {participant.isSpeaking && (
          <p className="mt-2 text-xs sm:text-sm text-primary font-medium animate-fade-in">Speaking...</p>
        )}
      </div>
    </div>
  )
}
