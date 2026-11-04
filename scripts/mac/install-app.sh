#!/usr/bin/env bash
# Installs a built SuperFin.app (the iPad app) into /Applications the way the
# Mac runs iPad apps: wrapped, Wrapper/SuperFin.app plus a WrappedBundle link.
#
#   install-app.sh path/to/SuperFin.app
#
# The new copy is put together beside the old one and swapped in at the end,
# so a failure halfway leaves the installed app as it was. A SuperFin that is
# open keeps running from what it loaded; the new copy opens next launch.
set -euo pipefail

src=${1:?usage: install-app.sh path/to/SuperFin.app}
dest=/Applications/SuperFin.app
staging=$(mktemp -d /Applications/.SuperFin.XXXXXX)
trap 'rm -rf "$staging"' EXIT

mkdir -p "$staging/SuperFin.app/Wrapper"
ditto "$src" "$staging/SuperFin.app/Wrapper/SuperFin.app"
ln -s Wrapper/SuperFin.app "$staging/SuperFin.app/WrappedBundle"

old=""
if [[ -e "$dest" ]]; then
  old="$staging/old"
  mv "$dest" "$old"
fi
mv "$staging/SuperFin.app" "$dest"
echo "installed $dest"
