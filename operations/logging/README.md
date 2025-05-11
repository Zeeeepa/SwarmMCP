# Logging for Unified MCP Server

This directory contains logging configuration for the Unified MCP Server.

## Logging Stack

The Unified MCP Server uses the following logging stack:

- **Structured Logging**: JSON-formatted logs for machine readability
- **ELK Stack**: Elasticsearch, Logstash, and Kibana for log storage and visualization
- **Fluentd**: For log collection and forwarding

## Log Levels

The Unified MCP Server uses the following log levels:

- **error**: Error events that might still allow the application to continue running
- **warn**: Potentially harmful situations that should be addressed
- **info**: Informational messages that highlight the progress of the application
- **debug**: Detailed information, typically useful only when diagnosing problems
- **trace**: Very detailed information, typically useful only when diagnosing problems

## Log Format

The Unified MCP Server logs are structured in JSON format with the following fields:

- **timestamp**: ISO 8601 timestamp
- **level**: Log level
- **message**: Log message
- **service**: Service name
- **hostname**: Host name
- **pid**: Process ID
- **context**: Additional context information
- **error**: Error information (if applicable)

## Setup

To set up logging:

1. Deploy the ELK stack using Docker Compose or Kubernetes
2. Configure Fluentd to collect logs from the Unified MCP Server
3. Configure Kibana dashboards for log visualization

## Docker Compose Setup

```bash
# Navigate to the docker directory
cd deployment/docker

# Build and start the containers
docker-compose up -d

# Access Kibana
open http://localhost:5601
```

## Kubernetes Setup

```bash
# Apply the Kubernetes manifests
kubectl apply -f operations/logging/kubernetes/

# Port forward to Kibana
kubectl port-forward svc/kibana 5601:5601

# Access Kibana
open http://localhost:5601
```

## Log Retention

Logs are retained for 30 days by default. To change the retention period:

1. Edit the Elasticsearch configuration
2. Update the index lifecycle management (ILM) policy

## Log Rotation

Logs are rotated daily by default. To change the rotation period:

1. Edit the Logstash configuration
2. Update the index pattern

## Log Queries

To query logs in Kibana:

1. Navigate to Kibana
2. Go to the Discover tab
3. Select the index pattern
4. Enter your query in the search bar

Example queries:

- `level:error`: Show all error logs
- `message:*error*`: Show all logs with "error" in the message
- `context.user:*`: Show all logs with user context
- `error.name:*`: Show all logs with error information

