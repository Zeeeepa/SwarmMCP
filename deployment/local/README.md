# Local Development Setup for Unified MCP Server

This directory contains configuration and scripts for setting up the Unified MCP Server for local development.

## Prerequisites

- Node.js 18+
- npm 8+
- Git

## Setup

1. Clone the repository:

```bash
git clone https://github.com/Zeeeepa/unified-mcp-server.git
cd unified-mcp-server
```

2. Install dependencies:

```bash
# Install dependencies for serv
cd serv
npm install
cd ..

# Install dependencies for SwarmMCP
cd swarmmcp
npm install
cd ..
```

3. Set up environment variables:

```bash
# Copy the example environment file
cp deployment/local/.env.example .env

# Edit the .env file with your configuration
nano .env
```

4. Build the TypeScript code:

```bash
# Build serv
cd serv
npm run build
cd ..
```

## Running the Server

To start the Unified MCP Server in development mode:

```bash
# Start the server
npm run dev
```

This will start the server with hot reloading enabled.

## Development Workflow

1. Make changes to the code
2. The server will automatically reload with your changes
3. Run tests to ensure your changes work as expected

## Running Tests

To run tests:

```bash
# Run serv tests
cd serv
npm test
cd ..

# Run SwarmMCP tests
cd swarmmcp
npm test
cd ..
```

## Debugging

To debug the server:

1. Start the server in debug mode:

```bash
npm run dev:debug
```

2. Connect to the debugger using your IDE or Chrome DevTools

## Local Docker Development

For local development with Docker:

```bash
# Build and start the containers
docker-compose -f deployment/local/docker-compose.dev.yml up -d

# View logs
docker-compose -f deployment/local/docker-compose.dev.yml logs -f
```

This will start the server with volume mounts for local development, enabling hot reloading of code changes.

