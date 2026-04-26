#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$ROOT_DIR/build/iPod Music.app"
CONTENTS_DIR="$APP_DIR/Contents"
MACOS_DIR="$CONTENTS_DIR/MacOS"
RESOURCES_DIR="$CONTENTS_DIR/Resources"

mkdir -p "$MACOS_DIR" "$RESOURCES_DIR"

cp "$ROOT_DIR/mac/Info.plist" "$CONTENTS_DIR/Info.plist"
cp "$ROOT_DIR/index.html" "$RESOURCES_DIR/index.html"
cp "$ROOT_DIR/app.js" "$RESOURCES_DIR/app.js"
cp "$ROOT_DIR/styles.css" "$RESOURCES_DIR/styles.css"
cp -r "$ROOT_DIR/libs" "$RESOURCES_DIR/libs"

swiftc "$ROOT_DIR/mac/iPodMusicApp.swift" \
  -o "$MACOS_DIR/iPodMusic" \
  -framework Cocoa \
  -framework WebKit

chmod +x "$MACOS_DIR/iPodMusic"
codesign --force --deep --sign - --timestamp=none "$APP_DIR"
ditto "$APP_DIR" "$ROOT_DIR/iPod Music.app"

echo "$ROOT_DIR/iPod Music.app"
