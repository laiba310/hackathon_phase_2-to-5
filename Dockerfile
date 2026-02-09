# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY next.config.js ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . ./

# Build the Next.js app
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy the built application and dependencies from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Change ownership to the node user
RUN chown -R node:node /app

# Switch to node user
USER node

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]