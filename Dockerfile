# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for building
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Full node_modules from the builder so the runtime has the `prisma` CLI (for
# `migrate deploy`) and `tsx` (for the seed script) — the standalone output's
# pruned node_modules has neither. The .next/standalone copy above lays down its
# own minimal node_modules first; this overlays the complete set on top.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Entrypoint: runs migrations (fail-loud) + seed before starting the server.
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Create directory for SQLite database with proper permissions
RUN mkdir -p /app/data && \
    chown -R nextjs:nodejs /app/data

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

CMD ["./docker-entrypoint.sh"]