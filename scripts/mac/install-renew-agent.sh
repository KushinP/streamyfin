#!/usr/bin/env bash
# Sets this Mac up to renew SuperFin on its own: a LaunchAgent that runs
# scripts/mac/renew.sh every 3 days (a free Apple ID signs for 7), and at the
# next wake when the Mac was asleep at the time.
#
#   scripts/mac/install-renew-agent.sh             install, and renew now
#   scripts/mac/install-renew-agent.sh --uninstall remove it
#
# renew.sh asks Apple for a fresh profile on your account each time
# (xcodebuild -allowProvisioningUpdates), which is why you run this yourself.
set -euo pipefail

label=com.kushagra.superfin.renew
plist="$HOME/Library/LaunchAgents/$label.plist"
repo=$(cd "$(dirname "$0")/../.." && pwd)
every=$((3 * 24 * 60 * 60))

if [[ "${1:-}" == "--uninstall" ]]; then
  launchctl bootout "gui/$(id -u)/$label" 2>/dev/null || true
  rm -f "$plist"
  echo "removed $label"
  exit 0
fi

mkdir -p "$HOME/Library/LaunchAgents" "$HOME/Library/Logs/SuperFin"
cat >"$plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$label</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$repo/scripts/mac/renew.sh</string>
  </array>
  <key>StartInterval</key><integer>$every</integer>
  <key>RunAtLoad</key><true/>
  <key>ProcessType</key><string>Background</string>
  <key>StandardOutPath</key><string>$HOME/Library/Logs/SuperFin/agent.log</string>
  <key>StandardErrorPath</key><string>$HOME/Library/Logs/SuperFin/agent.log</string>
</dict>
</plist>
PLIST

launchctl bootout "gui/$(id -u)/$label" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$plist"
echo "installed $label: renews now, then every 3 days"
echo "log: ~/Library/Logs/SuperFin/renew.log"
