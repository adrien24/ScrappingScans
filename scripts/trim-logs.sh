#!/bin/bash
# trim-logs.sh
# Garde les fichiers de logs PM2 à un maximum de MAX_LINES lignes.
# À lancer via cron toutes les N minutes.

MAX_LINES=5000
LOGS_DIR="$(cd "$(dirname "$0")/../logs" && pwd)"
OUT_LOG="$LOGS_DIR/pm2-out-0.log"
ERR_LOG="$LOGS_DIR/pm2-error-0.log"

trim_log() {
  local file="$1"

  if [ ! -f "$file" ]; then
    return
  fi

  local count
  count=$(wc -l < "$file")

  if [ "$count" -gt "$MAX_LINES" ]; then
    local tmp="${file}.tmp"
    tail -n "$MAX_LINES" "$file" > "$tmp" && mv "$tmp" "$file"
    # Demande à PM2 de rouvrir ses fichiers de log sur le nouvel inode
    pm2 reloadLogs > /dev/null 2>&1
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [trim-logs] $file : $count → $MAX_LINES lignes"
  fi
}

trim_log "$OUT_LOG"
trim_log "$ERR_LOG"
