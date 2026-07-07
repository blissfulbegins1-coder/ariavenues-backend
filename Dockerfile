# ---------------------------------------
# Stage 1 - Build
# ---------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# ---------------------------------------
# Stage 2 - Production
# ---------------------------------------
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 3001

# Start application
CMD ["node", "dist/index.js"]