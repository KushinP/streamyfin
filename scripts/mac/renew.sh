#!/usr/bin/env bash
# Renews SuperFin on this Mac before its free Apple ID signature runs out
# (7 days), and leaves a copy in iCloud Drive for a second Mac to pick up.
# Run by the LaunchAgent install-renew-agent.sh sets up; safe to run by hand.
#
#   scripts/mac/renew.sh                 rebuild, install, publish to iCloud
#   scripts/mac/renew.sh --no-provision  the same, without asking Apple for a
#                                        new profile (uses the one Xcode has)
#
# See docs/sideloading.md, "Keeping the Macs signed".
set -euo pipefail

repo=$(cd "$(dirname "$0")/../.." && pwd)
log_dir="$HOME/Library/Logs/SuperFin"
icloud_dir="$HOME/Library/Mobile Documents/com~apple~CloudDocs/SuperFin"
derived="$repo/build/dd-mac"
provision=(-allowProvisioningUpdates)
[[ "${1:-}" == "--no-provision" ]] && provision=()

mkdir -p "$log_dir"
exec >>"$log_dir/renew.log" 2>&1
echo "== $(date '+%Y-%m-%d %H:%M:%S') renew"

notify() {
  /usr/bin/osascript -e "display notification \"$1\" with title \"SuperFin renew\"" || true
}
trap 'echo "failed at line $LINENO"; notify "Renewing failed. Open Xcode once, then see ~/Library/Logs/SuperFin/renew.log"' ERR

# A LaunchAgent starts with a bare PATH: Node (for the build's script phases)
# and Homebrew's tools live outside it.
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8

cd "$repo"
branch=$(git rev-parse --abbrev-ref HEAD)
echo "building $branch at $(git rev-parse --short HEAD)"
[[ "$branch" == "develop" ]] || echo "note: not on develop, this Mac gets $branch"

# This Mac, as the "Designed for iPad" destination Xcode lists for it.
mac_id=$(xcodebuild -workspace ios/SuperFin.xcworkspace -scheme SuperFin \
  -showdestinations 2>/dev/null |
  sed -n 's/.*platform:macOS, arch:arm64, variant:Designed for \[iPad,iPhone\], id:\([^,]*\),.*/\1/p' |
  head -1)
[[ -n "$mac_id" ]] || { echo "no Designed for iPad destination"; false; }

# ${provision[@]+...}: bash 3 (macOS's own) treats an empty array as unset.
xcodebuild -workspace ios/SuperFin.xcworkspace -scheme SuperFin \
  -configuration Release -destination "id=$mac_id" \
  -derivedDataPath "$derived" ${provision[@]+"${provision[@]}"} \
  ENABLE_USER_SCRIPT_SANDBOXING=NO build >"$log_dir/build.log" 2>&1 ||
  { tail -20 "$log_dir/build.log"; false; }

app="$derived/Build/Products/Release-iphoneos/SuperFin.app"
codesign --verify --deep "$app"
echo "signed until $(security cms -D -i "$app/embedded.mobileprovision" |
  plutil -extract ExpirationDate raw -o - -)"

"$repo/scripts/mac/install-app.sh" "$app"

# For a second Mac: install-air-agent.sh there watches this file.
mkdir -p "$icloud_dir"
ditto -c -k --keepParent "$app" "$icloud_dir/SuperFin.zip.partial"
mv -f "$icloud_dir/SuperFin.zip.partial" "$icloud_dir/SuperFin.zip"
# The second Mac has no repo: it sets itself up from these.
cp "$repo/scripts/mac/install-air-agent.sh" "$repo/scripts/mac/install-app.sh" "$icloud_dir/"
echo "published to iCloud Drive"
