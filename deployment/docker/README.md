# Docker Deployment for Unified MCP Server

This directory contains Docker configuration files for deploying the Unified MCP Server.

## Files

- `Dockerfile`: Multi-stage Dockerfile for building and running the Unified MCP Server
- `docker-compose.yml`: Docker Compose configuration for running the server with monitoring
- `entrypoint.sh`: Entrypoint script for the Docker container
- `prometheus/`: Prometheus configuration for monitoring
- `grafana/`: Grafana configuration for dashboards

## Quick Start

To build and run the Unified MCP Server using Docker Compose:

```bash
# Navigate to the docker directory
cd deployment/docker

# Build and start the containers
docker-compose up -d

# Check the status of the containers
docker-compose ps

# View logs
docker-compose logs -f unified-mcp-server
```

## Environment Variables

The following environment variables can be configured:

- `NODE_ENV`: Node.js environment (default: `production`)
- `PORT`: Port for the MCP server (default: `3000`)
- `LOG_LEVEL`: Logging level (default: `info`)

## Volumes

The Docker Compose configuration creates the following volumes:

- `mcp-logs`: For storing server logs
- `mcp-data`: For storing server data
- `prometheus-data`: For storing Prometheus metrics
- `grafana-data`: For storing Grafana dashboards

## Health Checks

The Unified MCP Server container includes a health check that periodically checks the `/health` endpoint to ensure the server is running properly.

## Monitoring

The Docker Compose configuration includes Prometheus and Grafana for monitoring:

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (username: `admin`, password: `admin`)

## Custom Configuration

To customize the configuration, you can:

1. Modify the environment variables in `docker-compose.yml`
2. Mount custom configuration files using volumes
3. Extend the Dockerfile for additional dependencies

