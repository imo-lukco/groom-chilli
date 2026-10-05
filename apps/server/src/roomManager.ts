import { Room, Player, VoteValue, DEFAULT_TEMPLATE_ID } from './types';
import { randomUUID } from 'crypto';

const rooms = new Map<string, Room>();

// Which browser tab (clientId) each player socket belongs to. Kept off the Room so it
// is never broadcast to other players.
const playerClients = new Map<string, string>();

// Rooms reachable by a fixed link (/room/PANDA). They are recreated on demand when
// someone joins, so the link survives the room emptying and server restarts.
// Random room ids are hex, so these non-hex ids never collide with them.
const PERMANENT_ROOMS: Record<string, string> = {
  PANDA: 'panda',
};

function getRoom(roomId: string): Room {
  const room = rooms.get(roomId);
  if (!room) throw new Error(`Room ${roomId} not found`);
  return room;
}

function broadcast(room: Room): Room {
  return structuredClone(room);
}

export function createRoom(playerName: string, socketId: string, clientId: string, templateId = DEFAULT_TEMPLATE_ID): Room {
  const roomId = randomUUID().slice(0, 8).toUpperCase();
  const player: Player = { id: socketId, name: playerName, vote: null };
  const room: Room = { id: roomId, players: [player], revealed: false, task: '', templateId, funFactIndex: null };
  rooms.set(roomId, room);
  playerClients.set(socketId, clientId);
  return broadcast(room);
}

export function joinRoom(roomId: string, playerName: string, socketId: string, clientId: string): Room {
  const room = getRoom(roomId);
  if (room.players.find((p) => p.id === socketId)) return broadcast(room);
  room.players.push({ id: socketId, name: playerName, vote: null });
  playerClients.set(socketId, clientId);
  return broadcast(room);
}

// Returns false when another player in the room already uses this name (case-insensitive).
// If that player is the same tab on an old socket (a reconnect the server has not noticed
// as a disconnect yet), the stale entry is dropped so the tab can take its name back.
export function claimName(roomId: string, playerName: string, socketId: string, clientId: string): boolean {
  const room = getRoom(roomId);
  const name = playerName.trim().toLowerCase();
  const holder = room.players.find((p) => p.id !== socketId && p.name.trim().toLowerCase() === name);
  if (!holder) return true;
  if (playerClients.get(holder.id) !== clientId) return false;
  room.players = room.players.filter((p) => p.id !== holder.id);
  playerClients.delete(holder.id);
  return true;
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
  playerClients.delete(socketId);
  if (room.players.length === 0) {
    rooms.delete(roomId);
    return null;
  }
  return broadcast(room);
}

export function roomExists(roomId: string): boolean {
  return rooms.has(roomId);
}

export function ensurePermanentRoom(roomId: string): void {
  const templateId = PERMANENT_ROOMS[roomId];
  if (!templateId || rooms.has(roomId)) return;
  rooms.set(roomId, { id: roomId, players: [], revealed: false, task: '', templateId, funFactIndex: null });
}