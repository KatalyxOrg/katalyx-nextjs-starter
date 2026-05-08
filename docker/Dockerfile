FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat wget
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
# Skip postinstall (prisma generate) here — DATABASE_URL is not available at
# this stage. We run prisma generate explicitly in the builder stage below.
RUN npm ci --ignore-scripts

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Generate Prisma client (no DB connection needed — just reads the schema).
RUN npx prisma generate
# Build Next.js. Provide placeholder env values so the Zod env validator passes;
# real secrets are injected at runtime via the compose file / host environment.
ARG BETTER_AUTH_SECRET=build_placeholder_at_least_32_chars_long_xx
ARG DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
RUN DATABASE_URL=${DATABASE_URL} BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET} npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
