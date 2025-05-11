#!/bin/bash
# Backup script for Unified MCP Server

# Default values
OUTPUT_DIR="./backup"
INCLUDE_LOGS=false
INCLUDE_DATA=true
INCLUDE_CONFIG=true
COMPRESS=true

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --output=*)
      OUTPUT_DIR="${1#*=}"
      shift
      ;;
    --include-logs)
      INCLUDE_LOGS=true
      shift
      ;;
    --exclude-data)
      INCLUDE_DATA=false
      shift
      ;;
    --exclude-config)
      INCLUDE_CONFIG=false
      shift
      ;;
    --no-compress)
      COMPRESS=false
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Function to create backup
create_backup() {
  # Create output directory if it doesn't exist
  mkdir -p "$OUTPUT_DIR"
  
  # Create timestamp
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  BACKUP_DIR="$OUTPUT_DIR/unified-mcp-backup-$TIMESTAMP"
  mkdir -p "$BACKUP_DIR"
  
  echo "Creating backup in $BACKUP_DIR..."
  
  # Backup data
  if [[ "$INCLUDE_DATA" == true ]]; then
    echo "Backing up data..."
    mkdir -p "$BACKUP_DIR/data"
    cp -r /app/data/* "$BACKUP_DIR/data/" 2>/dev/null || echo "No data to backup."
  fi
  
  # Backup config
  if [[ "$INCLUDE_CONFIG" == true ]]; then
    echo "Backing up configuration..."
    mkdir -p "$BACKUP_DIR/config"
    cp -r /app/config/* "$BACKUP_DIR/config/" 2>/dev/null || echo "No configuration to backup."
  fi
  
  # Backup logs
  if [[ "$INCLUDE_LOGS" == true ]]; then
    echo "Backing up logs..."
    mkdir -p "$BACKUP_DIR/logs"
    cp -r /app/logs/* "$BACKUP_DIR/logs/" 2>/dev/null || echo "No logs to backup."
  fi
  
  # Compress backup
  if [[ "$COMPRESS" == true ]]; then
    echo "Compressing backup..."
    cd "$OUTPUT_DIR"
    tar -czf "unified-mcp-backup-$TIMESTAMP.tar.gz" "unified-mcp-backup-$TIMESTAMP"
    rm -rf "unified-mcp-backup-$TIMESTAMP"
    echo "Backup created: $OUTPUT_DIR/unified-mcp-backup-$TIMESTAMP.tar.gz"
  else
    echo "Backup created: $BACKUP_DIR"
  fi
  
  return 0
}

# Main function
main() {
  create_backup
  exit $?
}

main

