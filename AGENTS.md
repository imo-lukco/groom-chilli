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

## UI / design system

### Color palette — do not change these values

All colors are CSS custom properties defined in `apps/web/src/index.css` `:root`. Always reference them by variable name. Never hardcode hex values.

| Variable | Value | Role |
|----------|-------|------|
| `--bg` | `#FDF3E3` | Page background (warm cream) |
| `--surface` | `#FFFFFF` | Card/panel backgrounds |
| `--primary` | `#C0392B` | Chilli red — primary CTAs, selected state, headings |
| `--primary-h` | `#9B2722` | Hover state for primary |
| `--accent` | `#E67E22` | Warm orange — secondary accents, focus rings, highlights |
| `--gold` | `#F1C40F` | Gold — used only inside the pepper reveal chalkboard |
| `--text` | `#2C1810` | Deep brown — all body text |
| `--muted` | `#8B6354` | Warm brown — labels, secondary text, placeholders |
| `--green` | `#2D6A4F` | Dark green — reserved for the chalkboard pepper reveal background only |
| `--radius` | `14px` | Standard border radius for cards and containers |
| `--shadow` | `0 4px 18px rgba(44,24,16,.12)` | Warm card shadow |

Do not introduce new color variables without explicit instruction. Any new color must be warm-toned (earth tones, reds, oranges) — never add blues, purples, or cold grays as UI colors.

### Typography — do not change fonts

- **Pacifico** (cursive) — display headings only: `.banner h1`, `.section-title`, pepper reveal labels, discussion banner title. Do not use for body copy or button text.
- **Nunito** (sans-serif) — everything else: body, buttons, inputs, labels.

Both fonts are loaded from Google Fonts in `apps/web/index.html`. Do not add other fonts.

Button text: `text-transform: uppercase`, `font-weight: 800`, `letter-spacing: .06em`.
Label text: `text-transform: uppercase`, `font-weight: 700`, `letter-spacing: .08em`, color `var(--muted)`.

### Component rules

**Use existing primitives before creating new ones:**
- Surface containers → `.card` class
- Buttons → `.btn` + one of `.btn-primary` / `.btn-secondary` / `.btn-accent` / `.btn-ghost`
- All buttons are pill-shaped (`border-radius: 999px`) — do not use square or lightly-rounded buttons
- Section headings → `.section-title` class (Pacifico + `var(--primary)`)
- Error states → `.error-msg` class

**Adding a new component:**
1. Create a matching `.css` file alongside the `.tsx` file (same name)
2. Use `var(--*)` tokens exclusively — no hardcoded colors, no inline styles for color/spacing
3. Use `var(--radius)` for cards/panels, `999px` for pill shapes, `10px` for inputs and small chips
4. Use `var(--shadow)` for box shadows on surfaces
5. Add hover/active transitions matching the existing pattern: `transition: transform .12s, box-shadow .12s`

**Do not** override global input or button styles inside component CSS — the globals in `index.css` already handle them.

### Spice theme — always respect this

- Vote values map to real peppers defined in `packages/shared/src/peppers.ts`. Do not invent new vote labels or rename peppers.
- Emoji choices are thematic: 🫑 🌶️ 🔥 👻 🦂 ☠️ 🍌 ❓ — match them to the pepper heat data; don't substitute generic shapes or icons.
- The **chalkboard style** (dark green `#1B2B1F` background, gold `#F1C40F` border, Pacifico font) is the identity of the pepper reveal panel. Do not reuse this style for other UI elements.
- The **diagonal stripe textures** on `.chilli-card` and the page `body` are part of the theme. Do not remove them.
- Confetti is always 🌶️ emojis (`Confetti.tsx`). Do not swap for generic particle shapes.
- Copy/microcopy should match the spicy tone: playful, warm, a little dramatic. Avoid bland generic labels.

### What not to do

- Do not import Tailwind, Material UI, Chakra UI, shadcn, or any external component library
- Do not use inline `style={{color: '...'}}` for anything that should use a CSS variable
- Do not change the body background diagonal-stripe pattern
- Do not use cold colors (blue, purple, gray) as primary or accent colors

## Key constraints

- **No persistence.** Room state lives in `roomManager.ts` as a `Map`. Server restart = all rooms gone. Do not add database dependencies without being asked.
- **Single container.** In production, the Express server serves both the API and the static web files. There is no nginx, CDN, or separate frontend host.
- **esbuild bundles the server.** The output is CommonJS (`--format=cjs`), so `__dirname` is available and the relative path `../../web/dist` resolves correctly at runtime inside the container.
- **Fly.io only.** Do not add Vercel or Railway configuration — those have been intentionally removed.