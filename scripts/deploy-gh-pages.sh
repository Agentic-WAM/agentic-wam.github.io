#!/usr/bin/env bash
# Build the static site and publish out/ to the gh-pages branch of `origin`
# (GitHub repo Settings -> Pages -> Source: "Deploy from a branch", gh-pages / root).
# This is how the T-Rex site is deployed; it needs no GitHub Actions / workflow token scope.
#
#   npm run deploy                                  # root site: https://<org>.github.io/
#   NEXT_PUBLIC_BASE_PATH=/<repo> npm run deploy    # project site: https://<org>.github.io/<repo>/
set -euo pipefail
cd "$(dirname "$0")/.."

REMOTE=$(git remote get-url origin)
npm run build
touch out/.nojekyll # let Pages serve the _next/ folder

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
cp -R out/. "$TMP"
git -C "$TMP" init -q -b gh-pages
git -C "$TMP" add -A
git -C "$TMP" commit -q -m "Deploy $(git rev-parse --short HEAD 2>/dev/null || echo local) at $(date -u +%Y-%m-%dT%H:%MZ)"
# gh-pages only ever holds the latest build, so it is replaced on every deploy.
git -C "$TMP" push -f "$REMOTE" gh-pages
echo "Pushed out/ to gh-pages on $REMOTE"
