# Production Deployment for Unified MCP Server

This directory contains configuration and documentation for deploying the Unified MCP Server in a production environment.

## Deployment Options

The Unified MCP Server can be deployed to production using:

1. **Docker**: For containerized deployment
2. **Kubernetes**: For orchestrated deployment
3. **Traditional Server**: For deployment on a traditional server

## Docker Deployment

For production deployment using Docker:

```bash
# Navigate to the docker directory
cd deployment/docker

# Build and start the containers
docker-compose -f docker-compose.prod.yml up -d

# Check the status of the containers
docker-compose -f docker-compose.prod.yml ps
```

## Kubernetes Deployment

For production deployment using Kubernetes, refer to the [Kubernetes Deployment Guide](../kubernetes/README.md).

## Traditional Server Deployment

For production deployment on a traditional server:

1. Install Node.js 18+ and npm 8+
2. Clone the repository
3. Install dependencies
4. Build the TypeScript code
5. Set up environment variables
6. Start the server using a process manager like PM2

```bash
# Install PM2
npm install -g pm2

# Start the server with PM2
pm2 start deployment/production/ecosystem.config.js

# Save the PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup
```

## Environment Variables

For production deployment, set the following environment variables:

```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
LOG_LEVEL=info
LOG_FORMAT=json
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=1d
ENABLE_METRICS=true
METRICS_PATH=/metrics
```

## Security Considerations

For production deployment, consider the following security measures:

1. Use HTTPS for all communication
2. Set up a reverse proxy like Nginx
3. Implement rate limiting
4. Use a strong JWT secret
5. Restrict access to the server
6. Set up a firewall
7. Regularly update dependencies

## Scaling Considerations

For scaling the Unified MCP Server in production:

1. Use a load balancer to distribute traffic
2. Scale horizontally by adding more instances
3. Use a distributed cache for session management
4. Use a message queue for asynchronous processing
5. Monitor resource usage and scale accordingly

## Monitoring and Logging

For monitoring and logging in production:

1. Set up centralized logging with ELK stack
2. Set up monitoring with Prometheus and Grafana
3. Set up alerting for critical events
4. Set up error tracking with Sentry
5. Set up usage analytics with Google Analytics

