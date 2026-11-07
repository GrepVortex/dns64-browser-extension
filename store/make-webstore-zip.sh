#!/usr/bin/env bash
# Baut das Upload-ZIP für den Chrome Web Store: manifest.json und alle Laufzeitdateien
# liegen im ZIP-Wurzelverzeichnis, Doku/Bilder/Schlüssel bleiben draußen.
set -euo pipefail

STORE="$(cd "$(dirname "$0")" && pwd)"
SRC="$(cd "$STORE/.." && pwd)"
VER="$(python3 -c "import json,sys;print(json.load(open('$SRC/manifest.json'))['version'])")"
OUT="$STORE/dns64-browser-extension-$VER-webstore.zip"

TMP="$(mktemp -d)"
rsync -a \
  --exclude 'store' --exclude 'docs' --exclude '.git' \
  --exclude '*.pem' --exclude '*.crx' --exclude '.gitignore' \
  "$SRC/" "$TMP/"

[ -f "$TMP/manifest.json" ] || { echo "manifest.json fehlt" >&2; exit 1; }
rm -f "$STORE"/dns64-browser-extension-*-webstore.zip
(cd "$TMP" && zip -qr "$OUT" .)
rm -rf "$TMP"

echo "ZIP: $OUT ($(du -h "$OUT" | cut -f1))"
unzip -l "$OUT" | tail -3
