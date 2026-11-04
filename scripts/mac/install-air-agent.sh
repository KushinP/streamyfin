#!/usr/bin/env bash
# Sets up a second Mac (the MacBook Air) to install each SuperFin the main Mac
# publishes to iCloud Drive (scripts/mac/renew.sh), with no repo or Xcode
# build here. Run it on the Air once, after registering the Air with Xcode
# (docs/sideloading.md, "A second Mac").
#
#   bash install-air-agent.sh             install
#   bash install-air-agent.sh --uninstall remove it
#
# It copies two small scripts to ~/Library/Application Support/SuperFin and
# adds a LaunchAgent that runs them when the iCloud copy changes.
set -euo pipefail

label=com.kushagra.superfin.receive
plist="$HOME/Library/LaunchAgents/$label.plist"
support="$HOME/Library/Application Support/SuperFin"
zip="$HOME/Library/Mobile Documents/com~apple~CloudDocs/SuperFin/SuperFin.zip"
here=$(cd "$(dirname "$0")" && pwd)

if [[ "${1:-}" == "--uninstall" ]]; then
  launchctl bootout "gui/$(id -u)/$label" 2>/dev/null || true
  rm -f "$plist"
  rm -rf "$support"
  echo "removed $label"
  exit 0
fi

mkdir -p "$support" "$HOME/Library/LaunchAgents" "$HOME/Library/Logs/SuperFin"
cp "$here/install-app.sh" "$support/install-app.sh"
cat >"$support/receive.sh" <<'RECEIVE'
#!/usr/bin/env bash
# Installs the SuperFin the main Mac left in iCloud Drive, when it is newer
# than the last one installed here.
set -euo pipefail
support="$HOME/Library/Application Support/SuperFin"
zip="$HOME/Library/Mobile Documents/com~apple~CloudDocs/SuperFin/SuperFin.zip"
exec >>"$HOME/Library/Logs/SuperFin/receive.log" 2>&1
echo "== $(date '+%Y-%m-%d %H:%M:%S') receive"
[[ -f "$zip" ]] || { echo "nothing in iCloud yet"; exit 0; }
# With Optimize Mac Storage the file can be a placeholder; fetch it first.
brctl download "$zip" 2>/dev/null || true
for _ in $(seq 1 60); do
  unzip -tq "$zip" >/dev/null 2>&1 && break
  sleep 5
done
stamp=$(stat -f %m "$zip")
[[ "$stamp" == "$(cat "$support/last" 2>/dev/null)" ]] && { echo "already installed"; exit 0; }
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
ditto -x -k "$zip" "$work"
"$support/install-app.sh" "$work/SuperFin.app"
echo "$stamp" >"$support/last"
/usr/bin/osascript -e 'display notification "Updated and signed for another week" with title "SuperFin"' || true
RECEIVE
chmod +x "$support/receive.sh" "$support/install-app.sh"

cat >"$plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$label</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$support/receive.sh</string>
  </array>
  <key>WatchPaths</key>
  <array><string>$zip</string></array>
  <key>StartInterval</key><integer>21600</integer>
  <key>RunAtLoad</key><true/>
  <key>ProcessType</key><string>Background</string>
</dict>
</plist>
PLIST

launchctl bootout "gui/$(id -u)/$label" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$plist"
echo "installed $label: installs each new SuperFin from iCloud Drive"
echo "log: ~/Library/Logs/SuperFin/receive.log"
