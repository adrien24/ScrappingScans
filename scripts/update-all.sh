#!/bin/bash

# Script appelé par PM2 toutes les 2h pour déclencher la mise à jour de tous les mangas

API_URL="http://localhost:3000/api/scraping/update-all"
LOG_FILE="/home/hangover/ScrappingScans/logs/update-all.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Déclenchement de update-all..." >> "$LOG_FILE"

RESPONSE=$(curl -s -o /tmp/update-all-response.json -w "%{http_code}" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  --max-time 600)

if [ "$RESPONSE" -eq 200 ] || [ "$RESPONSE" -eq 202 ]; then
  echo "[$DATE] ✅ update-all terminé avec succès (HTTP $RESPONSE)" >> "$LOG_FILE"
else
  echo "[$DATE] ❌ update-all a échoué (HTTP $RESPONSE)" >> "$LOG_FILE"
  cat /tmp/update-all-response.json >> "$LOG_FILE"
  echo "" >> "$LOG_FILE"
fi
