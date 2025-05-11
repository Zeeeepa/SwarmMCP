# Alerting for Unified MCP Server

This directory contains alerting configuration for the Unified MCP Server.

## Alerting Stack

The Unified MCP Server uses the following alerting stack:

- **Prometheus Alertmanager**: For alert routing and notification
- **Grafana Alerting**: For alert visualization and management
- **PagerDuty**: For on-call notification
- **Slack**: For team notification

## Alert Rules

The Unified MCP Server has the following alert rules:

- **HighRequestLatency**: 90th percentile of request latency is above 1s for 5m
- **HighErrorRate**: Error rate is above 10% for 5m
- **HighCPUUsage**: CPU usage is above 80% for 5m
- **HighMemoryUsage**: Memory usage is above 80% for 5m
- **InstanceDown**: Instance is down for 1m

## Alert Severity

The Unified MCP Server uses the following alert severity levels:

- **critical**: Requires immediate attention
- **warning**: Requires attention soon
- **info**: Informational alerts

## Alert Routing

Alerts are routed based on severity:

- **critical**: PagerDuty and Slack
- **warning**: Slack
- **info**: Slack

## Setup

To set up alerting:

1. Deploy Prometheus Alertmanager using Docker Compose or Kubernetes
2. Configure alert rules in Prometheus
3. Configure alert routing in Alertmanager
4. Configure notification channels in PagerDuty and Slack

## Docker Compose Setup

```bash
# Navigate to the docker directory
cd deployment/docker

# Build and start the containers
docker-compose up -d

# Access Alertmanager
open http://localhost:9093
```

## Kubernetes Setup

```bash
# Apply the Kubernetes manifests
kubectl apply -f operations/alerting/kubernetes/

# Port forward to Alertmanager
kubectl port-forward svc/alertmanager 9093:9093

# Access Alertmanager
open http://localhost:9093
```

## Alert Silencing

To silence alerts:

1. Navigate to Alertmanager
2. Click on the "Silences" tab
3. Click on "New Silence"
4. Configure the silence
5. Click on "Create"

## Alert Inhibition

To inhibit alerts:

1. Edit the Alertmanager configuration
2. Add inhibition rules
3. Restart Alertmanager

## Alert Testing

To test alerts:

1. Navigate to Prometheus
2. Click on the "Alerts" tab
3. Click on an alert
4. Click on "Test Rule"

