#!/bin/bash

# Restore MongoDB database
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore.sh <backup_directory>"
  exit 1
fi

# Copy backup to container
docker cp $BACKUP_FILE student-placement-mongodb:/tmp/backup

# Restore backup
docker exec student-placement-mongodb mongorestore \
  --username admin \
  --password admin123 \
  --authenticationDatabase admin \
  --drop \
  /tmp/backup

# Cleanup
docker exec student-placement-mongodb rm -rf /tmp/backup

echo "Restore completed from: $BACKUP_FILE"