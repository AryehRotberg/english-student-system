# Build stage
FROM node:25-alpine AS builder

RUN npm install -g npm@latest

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:25-alpine

# Set timezone
ENV TZ=Asia/Jerusalem
RUN apk update && apk upgrade && apk add --no-cache tzdata

WORKDIR /usr/src/app

RUN npm install -g npm@latest && npm cache clean --force

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder
COPY --from=builder /usr/src/app/dist ./dist

# Copy SSL certificates for Postgres connection
COPY --from=builder /usr/src/app/certs ./certs

# Expose port (Cloud Run injects PORT=8080 at runtime)
EXPOSE 8080

# Start the application
CMD ["npm", "run", "start:prod"]