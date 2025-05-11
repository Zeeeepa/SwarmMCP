# Unified MCP Server Deployment

This directory contains deployment configurations and documentation for the Unified MCP Server, which combines the agent capabilities of `serv` with the task management features of `SwarmMCP`.

## Deployment Options

The Unified MCP Server supports the following deployment options:

- [Local Development](./local/README.md): Setup for local development and testing
- [Docker Containerization](./docker/README.md): Docker-based deployment for containerized environments
- [Kubernetes Deployment](./kubernetes/README.md): Kubernetes manifests for orchestrated deployment
- [Production Deployment](./production/README.md): Configuration for production environments

## Directory Structure

```
deployment/
├── docker/           # Docker containerization files
├── kubernetes/       # Kubernetes deployment manifests
├── local/            # Local development setup
└── production/       # Production deployment configuration
```

## Getting Started

For a quick start, refer to the [Local Development](./local/README.md) guide to set up the Unified MCP Server on your local machine.

For production deployments, refer to the [Production Deployment](./production/README.md) guide.

