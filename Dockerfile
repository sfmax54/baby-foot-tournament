# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Install OpenSSL and other dependencies required by Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only (includes prisma and @prisma/client)
RUN npm ci --omit=dev

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/.output ./.output

# Copy Prisma Client to the output directory where Nuxt expects it
RUN mkdir -p .output/server/node_modules/.prisma && \
    mkdir -p .output/server/node_modules/@prisma && \
    cp -r node_modules/.prisma/client .output/server/node_modules/.prisma/ && \
    cp -r node_modules/@prisma/client .output/server/node_modules/@prisma/

# Create directory for SQLite database
RUN mkdir -p /app/data

# Environment variables
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV DATABASE_URL="file:/app/data/dev.db"
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start command - migrate database and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node .output/server/index.mjs"]
