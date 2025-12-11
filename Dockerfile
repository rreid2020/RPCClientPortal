# Multi-stage build for Express backend
# Optimized for DigitalOcean App Platform

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy root package files (for Prisma)
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --ignore-scripts; else npm install --ignore-scripts; fi

# Copy backend package files
COPY backend/package.json backend/package-lock.json* ./backend/
WORKDIR /app/backend
RUN if [ -f package-lock.json ]; then npm ci --ignore-scripts; else npm install --ignore-scripts; fi

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# Copy Prisma schema and config
COPY prisma ./prisma
COPY package.json package-lock.json* ./

# Copy backend source
COPY backend ./backend

# Generate Prisma Client (from root where Prisma is installed)
WORKDIR /app
RUN npx prisma generate

# Build backend TypeScript (Prisma Client will be in root node_modules)
WORKDIR /app/backend
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy Prisma files and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin

# Copy backend build output and dependencies
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/package.json ./backend/package.json

# Copy root package.json for Prisma Client resolution
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Set correct permissions
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

WORKDIR /app/backend
CMD ["node", "dist/index.js"]

