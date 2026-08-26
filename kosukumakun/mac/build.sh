#!/bin/bash
# こすくまくん.app をビルドする。
#   ./build.sh          … Apple Silicon だけ（開発中はこっちが速い）
#   ./build.sh universal … Intel Mac でも動く universal binary（配布用）
#
# 未署名でも配れる（初回だけ「システム設定 > プライバシーとセキュリティ > このまま開く」）。
# Developer ID 証明書が入っていれば SIGN_ID を渡すと署名する:
#   SIGN_ID="Developer ID Application: ..." ./build.sh universal
set -euo pipefail
cd "$(dirname "$0")"

NAME="Kosukumakun"
DISPLAY="こすくまくん"
BUNDLE_ID="com.kosukuma.kosukumakun"
VERSION="0.1.0"
MIN_OS="13.0"
BUILD="build"
MODE="${1:-arm64}"

SRC=(Sources/Kosukumakun/*.swift)
mkdir -p "$BUILD"

compile() {  # $1 = arch
  echo "  compiling $1 ..."
  swiftc -O -whole-module-optimization \
    -target "$1-apple-macosx$MIN_OS" \
    -o "$BUILD/$NAME-$1" "${SRC[@]}"
}

if [ "$MODE" = "universal" ]; then
  compile arm64
  compile x86_64
  lipo -create -output "$BUILD/$NAME" "$BUILD/$NAME-arm64" "$BUILD/$NAME-x86_64"
else
  compile arm64
  cp "$BUILD/$NAME-arm64" "$BUILD/$NAME"
fi

APP="$BUILD/$DISPLAY.app"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp "$BUILD/$NAME" "$APP/Contents/MacOS/$NAME"
cp Assets/kosukuma.json "$APP/Contents/Resources/"   # ドット絵を焼く元（ベクター）
cp Assets/sprites.json  "$APP/Contents/Resources/"   # 実際に画面に出るドット絵
[ -f "Assets/AppIcon.icns" ] && cp Assets/AppIcon.icns "$APP/Contents/Resources/"

cat > "$APP/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>$NAME</string>
  <key>CFBundleDisplayName</key><string>$DISPLAY</string>
  <key>CFBundleExecutable</key><string>$NAME</string>
  <key>CFBundleIdentifier</key><string>$BUNDLE_ID</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>$VERSION</string>
  <key>CFBundleVersion</key><string>$VERSION</string>
  <key>CFBundleIconFile</key><string>AppIcon</string>
  <key>LSMinimumSystemVersion</key><string>$MIN_OS</string>
  <key>LSUIElement</key><true/>
  <key>NSHighResolutionCapable</key><true/>
  <key>NSSupportsAutomaticTermination</key><false/>
  <key>NSHumanReadableCopyright</key><string>こす.くま</string>
</dict>
</plist>
PLIST

if [ -n "${SIGN_ID:-}" ]; then
  echo "  signing with: $SIGN_ID"
  codesign --force --options runtime --timestamp --sign "$SIGN_ID" "$APP"
else
  # ad-hoc 署名。これが無いと Apple Silicon では起動すらできない
  codesign --force --sign - "$APP"
fi

# **自己点検を必ず通す。**
# 人の目で見て分かるバグばかりではない（実際、押しても剥がれないはずの子が
# 剥がれていたのに、画面を見ているだけでは気づけなかった）。
# ここで落ちたらビルドは失敗にする。中身は SelfTest.swift。
echo "  self test ..."
if ! "$APP/Contents/MacOS/$NAME" --selftest; then
  echo "✗ 自己点検で落ちました。直すまでこのビルドは配らないこと。" >&2
  exit 1
fi

SIZE=$(du -sh "$APP" | cut -f1)
echo "✓ $APP  ($SIZE)"
