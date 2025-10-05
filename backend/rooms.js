// Room management logic
const rooms = new Map()

export function createRoom() {
  const roomId = generateRoomId()
  const joinCode = generateJoinCode()

  rooms.set(roomId, {
    id: roomId,
    joinCode,
    participants: [],
    createdAt: Date.now(),
  })

  return { roomId, joinCode }
}

export function getRoomByCode(joinCode) {
  for (const [roomId, room] of rooms.entries()) {
    if (room.joinCode === joinCode) {
      return { roomId, room }
    }
  }
  return null
}

export function getRoomById(roomId) {
  return rooms.get(roomId)
}

export function addParticipant(roomId, participant) {
  const room = rooms.get(roomId)
  if (!room) return false

  if (room.participants.length >= 4) {
    return false // Room is full
  }

  room.participants.push(participant)
  return true
}

export function removeParticipant(roomId, socketId) {
  const room = rooms.get(roomId)
  if (!room) return

  room.participants = room.participants.filter((p) => p.socketId !== socketId)

  // Clean up empty rooms
  if (room.participants.length === 0) {
    rooms.delete(roomId)
  }
}

export function getParticipants(roomId) {
  const room = rooms.get(roomId)
  return room ? room.participants : []
}

// Helper functions
function generateRoomId() {
  return Array.from({ length: 16 }, () => "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]).join("")
}

function generateJoinCode() {
  return Array.from({ length: 12 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join(
    "",
  )
}
