# ---------- Stage 1: dependencies ----------
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN npm ci

# ---------- Stage 2: build ----------
FROM deps AS build

COPY . .
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    npm run db:generate -w apps/api \
    && npm run build -w apps/api \
    && npm prune --omit=dev

# ---------- Stage 3: runtime ----------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/prisma7.config.ts ./apps/api/prisma7.config.ts

USER node
EXPOSE 3000

WORKDIR /app/apps/api
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
