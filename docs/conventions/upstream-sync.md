# Upstream sync

This fork (SuperFin, `KushinP/streamyfin`) tracks upstream Streamyfin
(`streamyfin/streamyfin`, branch `develop`). The fork installs as a separate app and has
diverged in places upstream also edits, so upstream changes never land on `develop`
silently: they arrive as one PR that a person reviews and merges.

## How the sync works

[`.github/workflows/upstream-sync.yml`](../../.github/workflows/upstream-sync.yml) runs
daily at 05:17 UTC and on demand from the Actions tab (Run workflow).

1. It fetches upstream `develop` and compares it with the fork's `develop`. When upstream
   has nothing the fork lacks, it stops there and opens nothing.
2. It cuts `sync/upstream` from the fork's `develop` and merges upstream into it with a
   merge commit, then force pushes the branch.
3. It opens a PR from `sync/upstream` into `develop` titled
   `chore(sync): merge upstream Streamyfin`, or refreshes the body of the one already
   open. The body lists the upstream commits and a pre-merge checklist.
4. When `sync/upstream` already contains the current upstream tip, the run leaves the
   branch alone. That is what keeps a conflict you resolved on the branch from being
   overwritten by the next day's run.

Merge the PR with a **merge commit**, never squash or rebase. A squash drops upstream's
commits from the fork's history, so the next sync sees them as new and conflicts on every
file they touched.

### Tokens

The workflow works with the default `GITHUB_TOKEN`, with two limits GitHub puts on it:

- It cannot push commits that change `.github/workflows/`. A sync whose upstream range
  touches a workflow fails at the push step with an error that says so.
- PRs it opens do not start the `pull_request` workflows, so CI does not run on the sync
  PR until someone pushes to it (or closes and reopens it).

Both go away with a repository secret named `UPSTREAM_SYNC_TOKEN`: a fine-grained personal
access token on this repository with **Contents**, **Pull requests** and **Workflows** set
to read and write. The workflow uses it in place of `GITHUB_TOKEN` when it exists.

## When the merge conflicts

The workflow commits nothing broken. On a conflict it pushes upstream's tip unchanged to
`sync/upstream`, opens the PR anyway, lists the conflicted files in its body and labels it
`needs-merge`. GitHub then shows the same conflicts on the PR.

Small conflicts can be resolved in GitHub's conflict editor on the PR. For anything else,
resolve locally:

```bash
git fetch origin
git switch -C sync/upstream origin/develop
git merge origin/sync/upstream   # the upstream tip the workflow pushed
# resolve, keeping the fork's values in the files listed below
bun i && bun run test
git commit
git push --force-with-lease origin sync/upstream
```

The next scheduled run sees that `sync/upstream` already holds that upstream tip and
leaves it alone. Remove the `needs-merge` label once the PR merges cleanly. If upstream
moves on before you finish, the next run rebuilds the branch from scratch, so push your
resolution before then or rerun the steps above against the newer tip.

## Fork only files to watch

These are where upstream and the fork both make changes. In a conflict, or in a clean
merge that touched them, check that the fork kept its own values:

| Area | Files | What the fork keeps |
| --- | --- | --- |
| App identity | `app.json`, `app.config.ts` | bundle id `com.kushagra.superfin`, scheme `superfin://`, app name, EAS project |
| Brand | `assets/images/`, `tailwind.config.js` | SuperFin icons and splash, green in place of purple |
| Live TV | `app/(auth)/(tabs)/(home,libraries,search,favorites,watchlists,livetv)/livetv/`, `components/livetv/`, `utils/livetv/` | the new Live TV UI |
| Multiview | `components/multiview/`, `utils/multiview/` | fork only feature, upstream never touches it |
| Artwork tints | `utils/ambientTint.ts`, series and item pages | the artwork tinted pages |
| Translations | `translations/en.json` | the fork's added keys; other catalogues follow upstream's Crowdin output |
| Docs | `CLAUDE.md`, `docs/conventions/upstream-sync.md` | the fork's rows and notes |

Keep this table current when the fork starts diverging somewhere new.

## Upstream only workflows

Workflows that need upstream's secrets or act on upstream's tracker carry
`if: github.repository == 'streamyfin/streamyfin'` on the job: Crowdin, release, the
Discord notifications, the issue form updater, duplicate detection, the artifact comment,
the Seerr spec refresh and the signed iOS build. They stay in the tree, skipped, rather
than being deleted, so that upstream edits to them merge without a delete/modify
conflict. If a sync brings in a new workflow that needs upstream's secrets, add the same
guard in the sync PR.
