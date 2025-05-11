# Analytics for Unified MCP Server

This directory contains analytics configuration for the Unified MCP Server.

## Analytics Stack

The Unified MCP Server uses the following analytics stack:

- **Prometheus**: For metrics collection and storage
- **Grafana**: For metrics visualization and dashboards
- **Elasticsearch**: For log storage and analysis
- **Kibana**: For log visualization and dashboards
- **Google Analytics**: For usage analytics

## Metrics

The Unified MCP Server collects the following metrics:

- **HTTP Metrics**: Request count, latency, error rate
- **System Metrics**: CPU, memory, disk usage
- **Application Metrics**: Task count, agent count, tool usage
- **Business Metrics**: User count, task completion rate, tool usage

## Dashboards

The following Grafana dashboards are available:

- **Overview**: High-level overview of the server
- **HTTP**: Detailed HTTP metrics
- **System**: Detailed system metrics
- **Application**: Detailed application metrics
- **Business**: Detailed business metrics

## Setup

To set up analytics:

1. Deploy Prometheus and Grafana using Docker Compose or Kubernetes
2. Configure Prometheus to scrape metrics from the Unified MCP Server
3. Import the Grafana dashboards
4. Configure Google Analytics

## Docker Compose Setup

```bash
# Navigate to the docker directory
cd deployment/docker

# Build and start the containers
docker-compose up -d

# Access Grafana
open http://localhost:3001
```

## Kubernetes Setup

```bash
# Apply the Kubernetes manifests
kubectl apply -f operations/analytics/kubernetes/

# Port forward to Grafana
kubectl port-forward svc/grafana 3001:80

# Access Grafana
open http://localhost:3001
```

## Custom Metrics

To add custom metrics:

1. Define the metrics in the server code
2. Expose the metrics on the `/metrics` endpoint
3. Configure Prometheus to scrape the metrics
4. Create Grafana dashboards for the metrics

## Usage Analytics

To set up usage analytics:

1. Create a Google Analytics account
2. Configure the tracking code in the server
3. Configure the tracking code in the client
4. Configure custom events and dimensions

## Data Retention

Metrics and logs are retained for 30 days by default. To change the retention period:

1. Edit the Prometheus configuration
2. Edit the Elasticsearch configuration
3. Update the index lifecycle management (ILM) policy

