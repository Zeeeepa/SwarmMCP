# Kubernetes Deployment for Unified MCP Server

This directory contains Kubernetes manifests for deploying the Unified MCP Server in a Kubernetes cluster.

## Files

- `deployment.yaml`: Kubernetes Deployment for the Unified MCP Server
- `service.yaml`: Kubernetes Service for exposing the Unified MCP Server
- `ingress.yaml`: Kubernetes Ingress for routing external traffic to the Unified MCP Server
- `configmap.yaml`: Kubernetes ConfigMap for configuring the Unified MCP Server
- `prometheus.yaml`: Kubernetes resources for Prometheus monitoring
- `grafana.yaml`: Kubernetes resources for Grafana dashboards

## Prerequisites

- Kubernetes cluster (v1.19+)
- kubectl configured to communicate with your cluster
- Docker registry with the Unified MCP Server image

## Deployment

To deploy the Unified MCP Server to Kubernetes:

```bash
# Set environment variables
export DOCKER_REGISTRY=your-registry.example.com
export IMAGE_TAG=latest

# Apply the Kubernetes manifests
kubectl apply -f configmap.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml

# Verify the deployment
kubectl get pods -l app=unified-mcp-server
kubectl get svc unified-mcp-server
kubectl get ingress unified-mcp-server
```

## Configuration

The Unified MCP Server is configured using a ConfigMap. To modify the configuration:

1. Edit the `configmap.yaml` file
2. Apply the changes with `kubectl apply -f configmap.yaml`
3. Restart the deployment with `kubectl rollout restart deployment unified-mcp-server`

## Scaling

To scale the Unified MCP Server horizontally:

```bash
# Scale to 5 replicas
kubectl scale deployment unified-mcp-server --replicas=5
```

## Monitoring

To deploy Prometheus and Grafana for monitoring:

```bash
kubectl apply -f prometheus.yaml
kubectl apply -f grafana.yaml
```

## Accessing the Server

The Unified MCP Server is exposed through an Ingress at `mcp.example.com`. Update the host in `ingress.yaml` to match your domain.

## Troubleshooting

To view logs from the Unified MCP Server:

```bash
# Get pod names
kubectl get pods -l app=unified-mcp-server

# View logs from a specific pod
kubectl logs <pod-name>

# Stream logs from a specific pod
kubectl logs -f <pod-name>
```

