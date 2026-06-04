# AGENTS.md — Groom Chilli

## Project overview

Groom Chilli is a real-time planning poker app. Players join ephemeral rooms and vote on task complexity using chilli pepper values. All state is in-memory; there is no database. The app is deployed as a single Docker container on Fly.io.

## Repository layout

```
apps/server/src/
  index.ts          Entry point — Express + Socket.IO wiring, static file serving
  roomManager.ts    Pure state functions over an in-memory Map<roomId, Room>
  types.ts          Server-local type re-exports (duplicates packages/shared)

apps/web/src/
  socket.ts         socket.io-client singleton (autoConnect: false)
  pages/Home.tsx    Create / join room form
  pages/Room.tsx    Voting UI — listens to socket events and renders room state
  components/       ChilliCard, PlayerList, Results, Confetti

packages/shared/src/
  types.ts          Canonical types: VoteValue, Player, Template, Room
  templates.ts      Veverka (1,2,3,5,8,13,21) and Panda (0.5,1,2,3,5,8,13)
  peppers.ts        Pepper name/emoji/Scoville data keyed by vote number
```

## Running locally

```bash
npm install
cp .env.example apps/server/.env
cp .env.example apps/web/.env
npm run dev       # web on :5173, server on :3001
```

## Building

```bash
npm run build     # Vite build (web) + esbuild bundle (server)
npm start         # serve the built app on PORT (default 3001)
```

The server binary is a single bundled file at `apps/server/dist/index.js`. The web build output is at `apps/web/dist/`.

## Socket event protocol

All real-time communication goes through Socket.IO. The server tracks which room each socket belongs to via an internal `socketRoom: Map<socketId, roomId>`.

### Client → Server

| Event | Payload type | Effect |
|-------|-------------|--------|
| `create_room` | `{ playerName: string, templateId?: string }` | Creates room, auto-joins sender, emits `joined` back |
| `join_room` | `{ roomId: string, playerName: string }` | Joins existing room; emits `error` if not found |
| `cast_vote` | `{ vote: VoteValue }` | Records vote for sender; broadcasts `room_updated` |
| `reveal` | — | Flips `room.revealed = true`; broadcasts `room_updated` |
| `reset` | — | Clears all votes and revealed state; broadcasts `room_updated` |
| `set_task` | `{ task: string }` | Updates `room.task`; broadcasts `room_updated` |
| `disconnect` | — | Removes player from room; broadcasts `room_updated` (or nothing if room empty) |

### Server → Client

| Event | Payload type | Recipient |
|-------|-------------|-----------|
| `joined` | `{ room: Room, playerId: string }` | Joining client only |
| `room_updated` | `{ room: Room }` | All clients in the room |
| `error` | `{ message: string }` | Triggering client only |

### Types

```typescript
type VoteValue = number | '?';

interface Player { id: string; name: string; vote: VoteValue | null; }
interface Template { id: string; name: string; emoji: string; values: VoteValue[]; }
interface Room {
  id: string;
  players: Player[];
  revealed: boolean;
  task: string;
  templateId: string;
  funFactIndex: number | null;
}
```

## Environment variables

| Variable | App | Default | Description |
|----------|-----|---------|-------------|
| `PORT` | server | `3001` | Listen port. Fly.io sets this to `8080`. |
| `ALLOWED_ORIGIN` | server | `http://localhost:5173` | CORS origin for Socket.IO. Only relevant in local dev (different origins). |
| `VITE_SERVER_URL` | web | `''` | Socket.IO server URL. Empty string = current page origin (production default). |

## Key constraints

- **No persistence.** Room state lives in `roomManager.ts` as a `Map`. Server restart = all rooms gone. Do not add database dependencies without being asked.
- **Single container.** In production, the Express server serves both the API and the static web files. There is no nginx, CDN, or separate frontend host.
- **esbuild bundles the server.** The output is CommonJS (`--format=cjs`), so `__dirname` is available and the relative path `../../web/dist` resolves correctly at runtime inside the container.
- **Fly.io only.** Do not add Vercel or Railway configuration — those have been intentionally removed.