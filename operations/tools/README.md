# Operational Tools for Unified MCP Server

This directory contains operational tools for the Unified MCP Server.

## Server Management

### Health Check

The `health-check.sh` script checks the health of the Unified MCP Server:

```bash
# Check the health of the server
./health-check.sh http://localhost:3000
```

### Restart

The `restart.sh` script restarts the Unified MCP Server:

```bash
# Restart the server
./restart.sh
```

### Logs

The `logs.sh` script retrieves logs from the Unified MCP Server:

```bash
# Retrieve logs from the server
./logs.sh [--tail] [--follow] [--lines=100]
```

## Resource Management

### CPU Profiling

The `cpu-profile.sh` script profiles CPU usage of the Unified MCP Server:

```bash
# Profile CPU usage for 60 seconds
./cpu-profile.sh --duration=60
```

### Memory Profiling

The `memory-profile.sh` script profiles memory usage of the Unified MCP Server:

```bash
# Profile memory usage
./memory-profile.sh
```

### Disk Usage

The `disk-usage.sh` script analyzes disk usage of the Unified MCP Server:

```bash
# Analyze disk usage
./disk-usage.sh
```

## User Management

### User Creation

The `create-user.sh` script creates a new user:

```bash
# Create a new user
./create-user.sh --username=john --email=john@example.com --role=admin
```

### User Deletion

The `delete-user.sh` script deletes a user:

```bash
# Delete a user
./delete-user.sh --username=john
```

### User Listing

The `list-users.sh` script lists all users:

```bash
# List all users
./list-users.sh
```

## Backup and Recovery

### Backup

The `backup.sh` script creates a backup of the Unified MCP Server:

```bash
# Create a backup
./backup.sh --output=/path/to/backup
```

### Restore

The `restore.sh` script restores a backup of the Unified MCP Server:

```bash
# Restore a backup
./restore.sh --input=/path/to/backup
```

### Scheduled Backup

The `scheduled-backup.sh` script creates scheduled backups of the Unified MCP Server:

```bash
# Create scheduled backups
./scheduled-backup.sh --schedule="0 0 * * *" --output=/path/to/backup
```

## Upgrades and Migrations

### Version Check

The `version-check.sh` script checks the version of the Unified MCP Server:

```bash
# Check the version of the server
./version-check.sh
```

### Upgrade

The `upgrade.sh` script upgrades the Unified MCP Server:

```bash
# Upgrade the server
./upgrade.sh --version=1.0.0
```

### Migration

The `migrate.sh` script migrates data for the Unified MCP Server:

```bash
# Migrate data
./migrate.sh --from=0.9.0 --to=1.0.0
```

