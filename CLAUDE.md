# CLAUDE.md — Groom Chilli

For project architecture, socket event protocol, types, key constraints, and **UI/design system rules** see [AGENTS.md](./AGENTS.md).

## Dev commands

```bash
npm install          # install all workspace deps
npm run dev          # web :5173 + server :3001 concurrently
npm run build        # Vite build (web) then esbuild bundle (server)
npm start            # run built server (also serves web/dist as static files)
fly deploy           # build Docker image remotely and deploy to Fly.io
```

Always run from the repo root unless working on a single app in isolation.

## Local env setup

```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

## Common tasks

**Add a socket event:** handler in `apps/server/src/index.ts` → state mutation in `roomManager.ts` → emit from the relevant React component in `apps/web/src/pages/Room.tsx`.

**Add a vote template:** `packages/shared/src/templates.ts` + add pepper entries for new vote values in `packages/shared/src/peppers.ts`.

**Deploy:** `fly deploy` — Fly.io builds the Docker image remotely, no local build needed.

## Things to avoid

- Do not add a database — in-memory state is intentional
- Do not add Vercel or Railway config — removed intentionally, Fly.io only
- Do not run `npm install` inside the `build` script — Docker uses `npm ci`
