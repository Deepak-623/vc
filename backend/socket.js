import { getRoomById, addParticipant, removeParticipant, getParticipants } from "./rooms.js"

export function setupSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`[v0] User connected: ${socket.id}`)

    // Join room
    socket.on("join-room", ({ roomId, username, profilePicture }) => {
      const room = getRoomById(roomId)

      if (!room) {
        socket.emit("error", { message: "Room not found" })
        return
      }

      const success = addParticipant(roomId, {
        socketId: socket.id,
        username,
        profilePicture,
      })

      if (!success) {
        socket.emit("error", { message: "Room is full (max 4 participants)" })
        return
      }

      socket.join(roomId)
      socket.roomId = roomId

      // Send current participants to the new user
      const participants = getParticipants(roomId)
      socket.emit("room-joined", { participants })

      // Notify others about the new participant
      socket.to(roomId).emit("user-joined", {
        socketId: socket.id,
        username,
        profilePicture,
      })

      console.log(`[v0] User ${username} joined room ${roomId}`)
    })

    // WebRTC signaling
    socket.on("offer", ({ to, offer }) => {
      socket.to(to).emit("offer", { from: socket.id, offer })
    })

    socket.on("answer", ({ to, answer }) => {
      socket.to(to).emit("answer", { from: socket.id, answer })
    })

    socket.on("ice-candidate", ({ to, candidate }) => {
      socket.to(to).emit("ice-candidate", { from: socket.id, candidate })
    })

    // Disconnect
    socket.on("disconnect", () => {
      if (socket.roomId) {
        removeParticipant(socket.roomId, socket.id)
        socket.to(socket.roomId).emit("user-left", { socketId: socket.id })
        console.log(`[v0] User ${socket.id} left room ${socket.roomId}`)
      }
      console.log(`[v0] User disconnected: ${socket.id}`)
    })
  })
}
