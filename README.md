# Groom Chilli 🌶️

Figure's own scrumpoker ripoff! Assign story points with chilli peppers to rate the spiciness of the task!

Live at **[groom-chilli.fly.dev](https://groom-chilli.fly.dev)**

---

## Stack

| Layer        | Tech                                                       |
|--------------|------------------------------------------------------------|
| Frontend     | React 18, React Router v6, Vite                            |
| Backend      | Node.js, Express, Socket.IO                                |
| Shared types | `packages/shared` (TypeScript)                             |
| Deployment   | Fly.io — single container serves both frontend and backend |

---

## Local development

### Prerequisites

- Node.js 22+
- npm 10+

### Setup

```bash
npm install
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
npm run dev
```

- Web: http://localhost:5173
- Server: http://localhost:3001

The `dev` script runs both the Vite dev server and the Express server concurrently with live reload.

### Environment variables

| Variable          | Used by   | Default                 | Description                                                                                                                      |
|-------------------|-----------|-------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `PORT`            | server    | `3001`                  | Port the Express server listens on                                                                                               |
| `ALLOWED_ORIGIN`  | server    | `http://localhost:5173` | CORS allowed origin (only matters when frontend and backend run on different origins, i.e. local dev)                            |
| `VITE_SERVER_URL` | web       | `''`                    | Socket.IO server URL. Empty string = current page origin (correct for production). Set to `http://localhost:3001` for local dev. |

---

## Building

```bash
npm run build        # builds web (Vite) then server (esbuild)
npm start            # runs the built server, which also serves web/dist as static files
```

The server bundles to a single `apps/server/dist/index.js` via esbuild. No `node_modules` are needed at runtime.

---

## Deployment (Fly.io)

The app runs as a single Docker container on Fly.io. The Express server serves the built React frontend as static files and handles all Socket.IO connections.

```bash
fly deploy           # build image, push, and deploy
fly logs             # stream logs
fly ssh console      # shell into running machine
```

Config lives in `fly.toml`. The container runs on `shared-cpu-1x` with 256 MB RAM in the `ams` (Amsterdam) region.

---

## Project structure

```
groom-chilli/
├── apps/
│   ├── server/          Express + Socket.IO backend
│   │   └── src/
│   │       ├── index.ts         entry point, socket event handlers, static file servingv
│   │       ├── roomManager.ts   in-memory room state (create, join, vote, reveal, reset)
│   │       └── types.ts         server-local types
│   └── web/             React frontend
│       └── src/
│           ├── socket.ts        socket.io-client singleton
│           ├── pages/           Home (create/join room), Room (voting UI)
│           └── components/      ChilliCard, PlayerList, Results, Confetti
├── packages/
│   └── shared/          Shared TypeScript types and data
│       └── src/
│           ├── types.ts         VoteValue, Player, Template, Room
│           ├── templates.ts     Veverka (1–21) and Panda (0.5–13) templates
│           └── peppers.ts       Pepper heat data keyed by vote value
├── Dockerfile
├── fly.toml
└── .env.example
```

---

## How it works

Rooms are ephemeral in-memory state on the server (`roomManager.ts`). All clients in a room receive real-time updates via Socket.IO. There is no database — restarting the server clears all rooms.

### Socket events

| Event (client → server)   | Payload                       | Description                                    |
|---------------------------|-------------------------------|------------------------------------------------|
| `create_room`             | `{ playerName, templateId? }` | Create a new room and join it                  |
| `join_room`               | `{ roomId, playerName }`      | Join an existing room by ID                    |
| `cast_vote`               | `{ vote }`                    | Submit or change your vote                     |
| `reveal`                  | —                             | Reveal all votes                               |
| `reset`                   | —                             | Clear votes and start a new round              |
| `set_task`                | `{ task }`                    | Set the task description for the current round |

| Event (server → client)   | Payload              | Description                                       |
|---------------------------|----------------------|---------------------------------------------------|
| `joined`                  | `{ room, playerId }` | Emitted to the joining client on success          |
| `room_updated`            | `{ room }`           | Broadcast to all room members on any state change |
| `error`                   | `{ message }`        | Emitted to a single client on failure             |