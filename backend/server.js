import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import { createRoom, getRoomByCode } from "./rooms.js"
import { setupSocketHandlers } from "./socket.js"

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "https://*.vercel.app"],
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(cors())
app.use(express.json())

// REST API endpoints
app.post("/api/create-room", (req, res) => {
  const { roomId, joinCode } = createRoom()
  res.json({ roomId, joinCode })
})

app.post("/api/validate-room", (req, res) => {
  const { joinCode } = req.body

  if (!joinCode) {
    return res.status(400).json({ error: "Join code is required" })
  }

  const result = getRoomByCode(joinCode)

  if (!result) {
    return res.status(404).json({ error: "Room not found" })
  }

  res.json({ roomId: result.roomId })
})

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

// Setup Socket.IO handlers
setupSocketHandlers(io)

// Start server
const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`[v0] Server running on port ${PORT}`)
})
