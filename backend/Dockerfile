# syntax=docker/dockerfile:1

# ---------- Base ----------
FROM node:22-slim AS base
WORKDIR /app
# OpenSSL is required by the Prisma query engine at runtime.
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ---------- Build ----------
FROM base AS build
# Toolchain for native modules (argon2).
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
# DATABASE_URL is only needed so Prisma can parse the schema during generate.
RUN DATABASE_URL="file:./prisma/dev.db" npx prisma generate

COPY tsconfig.json server.ts auth.ts ./
RUN npx tsc

# ---------- Runtime ----------
FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3001

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./
COPY docker-entrypoint.sh ./

# Bundle the current SQLite database as a one-time seed for the volume.
RUN cp ./prisma/dev.db ./prisma/seed.db || true
RUN chmod +x docker-entrypoint.sh

EXPOSE 3001
CMD ["./docker-entrypoint.sh"]
