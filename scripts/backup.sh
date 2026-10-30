#!/usr/bin/env bash
# Usage: MONGODB_URI="..." ./scripts/backup.sh   (needs MongoDB Database Tools)
set -euo pipefail
mkdir -p backups
FILE="backups/frame-$(date +%Y%m%d-%H%M%S).archive.gz"
mongodump --uri="$MONGODB_URI" --gzip --archive="$FILE"
echo "Backup saved: $FILE"
# Restore: mongorestore --uri="$MONGODB_URI" --gzip --archive="$FILE" --drop
