#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

APP_NAME="iPod Classic Simulator"
BUNDLE_NAME="${APP_NAME}.app"
BUILD_DIR="build/macos"
APP_DIR="${BUILD_DIR}/${BUNDLE_NAME}"
CONTENTS_DIR="${APP_DIR}/Contents"
MACOS_DIR="${CONTENTS_DIR}/MacOS"
RESOURCES_DIR="${CONTENTS_DIR}/Resources"
EXECUTABLE="iPodClassicSimulator"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "❌ macOS에서만 .app 생성이 가능합니다. (현재 OS: $(uname -s))"
  exit 1
fi

if ! command -v xcrun >/dev/null 2>&1; then
  echo "❌ Xcode Command Line Tools가 필요합니다. 아래 명령으로 설치하세요."
  echo "   xcode-select --install"
  exit 1
fi

SWIFTC_BIN="$(xcrun --find swiftc 2>/dev/null || true)"
if [[ -z "${SWIFTC_BIN}" ]]; then
  echo "❌ swiftc를 찾지 못했습니다. Xcode Command Line Tools 설치를 확인하세요."
  echo "   xcode-select --install"
  exit 1
fi

rm -rf "${APP_DIR}"
mkdir -p "${MACOS_DIR}" "${RESOURCES_DIR}"

"${SWIFTC_BIN}" macos/main.swift -framework Cocoa -framework WebKit -o "${MACOS_DIR}/${EXECUTABLE}"

cp index.html "${RESOURCES_DIR}/index.html"

cat > "${CONTENTS_DIR}/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleExecutable</key>
  <string>${EXECUTABLE}</string>
  <key>CFBundleIdentifier</key>
  <string>com.local.ipod-classic-simulator</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>${APP_NAME}</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>1.0</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>LSMinimumSystemVersion</key>
  <string>13.0</string>
  <key>NSHighResolutionCapable</key>
  <true/>
</dict>
</plist>
PLIST

echo "✅ Created: ${APP_DIR}"
echo "Run with: open \"${APP_DIR}\""
