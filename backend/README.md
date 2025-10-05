# VoiceHub Backend

WebRTC signaling server for VoiceHub voice chat application.

## Installation

\`\`\`bash
cd backend
npm install
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`

## Production

\`\`\`bash
npm start
\`\`\`

## Environment Variables

- `PORT` - Server port (default: 3001)

## API Endpoints

### POST /api/create-room
Creates a new room and returns roomId and joinCode.

### POST /api/validate-room
Validates a join code and returns the roomId.

### GET /api/health
Health check endpoint.

## Socket.IO Events

### Client → Server
- `join-room` - Join a room with username and profile picture
- `offer` - Send WebRTC offer to peer
- `answer` - Send WebRTC answer to peer
- `ice-candidate` - Send ICE candidate to peer

### Server → Client
- `room-joined` - Confirmation with current participants
- `user-joined` - New user joined the room
- `user-left` - User left the room
- `offer` - Received WebRTC offer from peer
- `answer` - Received WebRTC answer from peer
- `ice-candidate` - Received ICE candidate from peer
- `error` - Error message
