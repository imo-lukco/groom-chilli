FROM node:22-slim AS build

WORKDIR /app

# Copy all package.json files before npm ci so workspaces are resolved correctly
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/server/package.json ./apps/server/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN npm ci

COPY . .

RUN npm run build

FROM node:22-slim

WORKDIR /app

# Server is bundled by esbuild — no node_modules needed at runtime
COPY --from=build /app/apps/server/dist ./apps/server/dist
COPY --from=build /app/apps/web/dist ./apps/web/dist

EXPOSE 8080

CMD ["node", "apps/server/dist/index.js"]
