import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { VoteValue } from '@groom-chilli/shared';
import * as rm from './roomManager.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
});

// Track which room each socket is in
const socketRoom = new Map<string, string>();

io.on('connection', (socket) => {
  socket.on('create_room', ({ playerName, templateId }: { playerName: string; templateId?: string }) => {
    const room = rm.createRoom(playerName, socket.id, templateId);
    socketRoom.set(socket.id, room.id);
    socket.join(room.id);
    socket.emit('joined', { room, playerId: socket.id });
  });

  socket.on('join_room', ({ roomId, playerName }: { roomId: string; playerName: string }) => {
    const id = roomId.trim().toUpperCase();
    if (!rm.roomExists(id)) {
      socket.emit('error', { message: `Room "${id}" not found` });
      return;
    }
    const room = rm.joinRoom(id, playerName, socket.id);
    socketRoom.set(socket.id, room.id);
    socket.join(room.id);
    socket.emit('joined', { room, playerId: socket.id });
    socket.to(room.id).emit('room_updated', { room });
  });

  socket.on('cast_vote', ({ vote }: { vote: VoteValue }) => {
    const roomId = socketRoom.get(socket.id);
    if (!roomId) return;
    const room = rm.castVote(roomId, socket.id, vote);
    io.to(roomId).emit('room_updated', { room });
  });

  socket.on('reveal', () => {
    const roomId = socketRoom.get(socket.id);
    if (!roomId) return;
    const room = rm.reveal(roomId);
    io.to(roomId).emit('room_updated', { room });
  });

  socket.on('reset', () => {
    const roomId = socketRoom.get(socket.id);
    if (!roomId) return;
    const room = rm.reset(roomId);
    io.to(roomId).emit('room_updated', { room });
  });

  socket.on('set_task', ({ task }: { task: string }) => {
    const roomId = socketRoom.get(socket.id);
    if (!roomId) return;
    const room = rm.setTask(roomId, task);
    io.to(roomId).emit('room_updated', { room });
  });

  socket.on('disconnect', () => {
    const roomId = socketRoom.get(socket.id);
    socketRoom.delete(socket.id);
    if (!roomId) return;
    const room = rm.removePlayer(roomId, socket.id);
    if (room) io.to(roomId).emit('room_updated', { room });
  });
});

const PORT = process.env.PORT ?? 3001;
httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));