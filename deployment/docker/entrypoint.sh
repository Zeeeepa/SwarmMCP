#!/bin/sh
set -e

# Print environment for debugging (excluding sensitive information)
echo "Starting Unified MCP Server with the following configuration:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "HOST: $HOST"
echo "LOG_LEVEL: $LOG_LEVEL"
echo "LOG_FORMAT: $LOG_FORMAT"

# Wait for dependencies if needed
if [ -n "$WAIT_FOR_DEPENDENCIES" ]; then
  echo "Waiting for dependencies to be ready..."
  # Add logic to wait for dependencies (e.g., database, message queue)
fi

# Run database migrations if needed
if [ -n "$RUN_MIGRATIONS" ]; then
  echo "Running database migrations..."
  # Add logic to run database migrations
fi

# Execute the command
echo "Executing command: $@"
exec "$@"

