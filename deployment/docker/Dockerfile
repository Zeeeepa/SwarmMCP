# Multi-stage build for Unified MCP Server

# Stage 1: Build serv (TypeScript)
FROM node:18-alpine AS serv-build
WORKDIR /app/serv

# Install dependencies
COPY serv/package*.json ./
RUN npm ci

# Copy source code
COPY serv/ ./

# Build TypeScript
RUN npm run build

# Stage 2: Build SwarmMCP (JavaScript)
FROM node:18-alpine AS swarmmcp-build
WORKDIR /app/swarmmcp

# Install dependencies
COPY swarmmcp/package*.json ./
RUN npm ci

# Copy source code
COPY swarmmcp/ ./

# Stage 3: Final image
FROM node:18-alpine
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built artifacts from previous stages
COPY --from=serv-build /app/serv/dist /app/serv/dist
COPY --from=serv-build /app/serv/package*.json /app/serv/
COPY --from=swarmmcp-build /app/swarmmcp /app/swarmmcp

# Copy configuration files
COPY deployment/docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Install monitoring tools
RUN apk add --no-cache curl

# Create directories for logs and data
RUN mkdir -p /app/logs /app/data

# Expose ports
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    LOG_LEVEL=info \
    LOG_FORMAT=json

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Set command
CMD ["node", "swarmmcp/mcp-server/server.js"]

