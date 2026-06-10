#!/bin/sh
set -e

if [ -z "$TYPESENSE_API_KEY" ]; then
  echo "TYPESENSE_API_KEY is required" >&2
  exit 1
fi

exec /opt/typesense-server \
  --data-dir /data \
  --api-key="$TYPESENSE_API_KEY" \
  --api-address=:: \
  --listen-port=8108 \
  --enable-cors
