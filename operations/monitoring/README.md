# Monitoring for Unified MCP Server

This directory contains monitoring configuration for the Unified MCP Server.

## Monitoring Stack

The Unified MCP Server uses the following monitoring stack:

- **Prometheus**: For metrics collection and storage
- **Grafana**: For metrics visualization and dashboards
- **Node Exporter**: For system metrics
- **cAdvisor**: For container metrics

## Metrics

The Unified MCP Server exposes the following metrics:

- **HTTP Metrics**: Request count, latency, error rate
- **System Metrics**: CPU, memory, disk usage
- **Application Metrics**: Task count, agent count, tool usage

## Dashboards

The following Grafana dashboards are available:

- **Overview**: High-level overview of the server
- **HTTP**: Detailed HTTP metrics
- **System**: Detailed system metrics
- **Application**: Detailed application metrics

## Setup

To set up monitoring:

1. Deploy Prometheus and Grafana using Docker Compose or Kubernetes
2. Configure Prometheus to scrape metrics from the Unified MCP Server
3. Import the Grafana dashboards

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
kubectl apply -f operations/monitoring/kubernetes/

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

## Alerting

To set up alerting:

1. Configure Prometheus alerting rules
2. Set up Alertmanager
3. Configure notification channels (email, Slack, etc.)

For more information, see the [Alerting Guide](../alerting/README.md).

