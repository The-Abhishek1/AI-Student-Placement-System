#!/bin/bash

# Backup MongoDB database
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/mongodb_backup_$TIMESTAMP"

# Create backup directory
mkdir -p $BACKUP_PATH

# Run backup
docker exec student-placement-mongodb mongodump \
  --username admin \
  --password admin123 \
  --authenticationDatabase admin \
  --out /tmp/backup

# Copy backup from container
docker cp student-placement-mongodb:/tmp/backup $BACKUP_PATH

# Cleanup container
docker exec student-placement-mongodb rm -rf /tmp/backup

echo "Backup completed: $BACKUP_PATH"