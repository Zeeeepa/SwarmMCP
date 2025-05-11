#!/bin/bash
# Health check script for Unified MCP Server

# Default values
URL="http://localhost:3000/health"
TIMEOUT=5
RETRIES=3
INTERVAL=1

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --url=*)
      URL="${1#*=}"
      shift
      ;;
    --timeout=*)
      TIMEOUT="${1#*=}"
      shift
      ;;
    --retries=*)
      RETRIES="${1#*=}"
      shift
      ;;
    --interval=*)
      INTERVAL="${1#*=}"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Function to check health
check_health() {
  echo "Checking health of $URL..."
  
  for ((i=1; i<=RETRIES; i++)); do
    response=$(curl -s -o /dev/null -w "%{http_code}" -m $TIMEOUT $URL)
    
    if [[ $response -eq 200 ]]; then
      echo "Health check passed! Server is healthy."
      return 0
    else
      echo "Attempt $i/$RETRIES failed with status code $response. Retrying in $INTERVAL seconds..."
      sleep $INTERVAL
    fi
  done
  
  echo "Health check failed after $RETRIES attempts. Server is unhealthy."
  return 1
}

# Main function
main() {
  check_health
  exit $?
}

main

