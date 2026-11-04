# Metro started with CI=1 does not watch files

**Date**: 2026-11-04
**Category**: tooling
**Key files**: none (how the dev server is started)

## Detail

`CI=1 bunx expo start` runs Metro in CI mode, and CI mode turns file watching
off. The server bundles the tree as it was at start and keeps serving that:
edits never reach the app, Fast Refresh does nothing, and relaunching the app
only reloads the same stale bundle. A fresh request with different query
parameters can still show the new code, which makes it look as though the app
is caching.

Start Metro without `CI=1` (with stdin from `/dev/null` when it runs in the
background) and it watches normally.

## Symptom pattern

A change is in the file but not in the running app, across relaunches.
`curl` of `index.ts.bundle` with the app's own parameters lacks the new code.
