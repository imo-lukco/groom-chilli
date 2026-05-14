import { Room, Player, VoteValue, DEFAULT_TEMPLATE_ID } from '@groom-chilli/shared';
import { randomUUID } from 'crypto';

const rooms = new Map<string, Room>();

function getRoom(roomId: string): Room {
  const room = rooms.get(roomId);
  if (!room) throw new Error(`Room ${roomId} not found`);
  return room;
}

function broadcast(room: Room): Room {
  return structuredClone(room);
}

export function createRoom(playerName: string, socketId: string, templateId = DEFAULT_TEMPLATE_ID): Room {
  const roomId = randomUUID().slice(0, 8).toUpperCase();
  const player: Player = { id: socketId, name: playerName, vote: null };
  const room: Room = { id: roomId, players: [player], revealed: false, task: '', templateId, funFactIndex: null };
  rooms.set(roomId, room);
  return broadcast(room);
}

export function joinRoom(roomId: string, playerName: string, socketId: string): Room {
  const room = getRoom(roomId);
  if (room.players.find((p) => p.id === socketId)) return broadcast(room);
  room.players.push({ id: socketId, name: playerName, vote: null });
  return broadcast(room);
}

export function castVote(roomId: string, socketId: string, vote: VoteValue): Room {
  const room = getRoom(roomId);
  const player = room.players.find((p) => p.id === socketId);
  if (player) player.vote = vote;
  return broadcast(room);
}

const FUN_FACTS_COUNT = 20;

export function reveal(roomId: string): Room {
  const room = getRoom(roomId);
  room.revealed = true;
  room.funFactIndex = Math.floor(Math.random() * FUN_FACTS_COUNT);
  return broadcast(room);
}

export function reset(roomId: string): Room {
  const room = getRoom(roomId);
  room.revealed = false;
  room.funFactIndex = null;
  room.players.forEach((p) => (p.vote = null));
  return broadcast(room);
}

export function setTask(roomId: string, task: string): Room {
  const room = getRoom(roomId);
  room.task = task;
  room.revealed = false;
  room.funFactIndex = null;
  room.players.forEach((p) => (p.vote = null));
  return broadcast(room);
}

export function removePlayer(roomId: string, socketId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.players = room.players.filter((p) => p.id !== socketId);
  if (room.players.length === 0) {
    rooms.delete(roomId);
    return null;
  }
  return broadcast(room);
}

export function roomExists(roomId: string): boolean {
  return rooms.has(roomId);
}