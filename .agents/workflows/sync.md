---
description: Sync - stage, commit, and push current work to GitHub
---

# /sync - Sync Progress with GitHub

Commit and push all current work-in-progress to the remote repository. Also pulls changes safely if the remote is ahead.

## Steps

1. Fetch latest from remote and check for divergence:
// turbo-all
```bash
git fetch origin && git status -sb
```

- If remote is **ahead** of local, STOP and ask the user if they want to pull before proceeding.
- If remote is **behind** or **even**, continue to step 2.
- If there is **divergence** (both ahead and behind), warn the user and recommend pulling with `--rebase`.
- If local is **ahead** (newer), explicitly point this out to the user and recommend running `/ship` to push to the remote.

2. Check what's changed locally:
```bash
git status && git diff --stat
```

3. Stage all changes:
```bash
git add -A
```

4. Ask the user for a commit message (or default to "Update from launchpad terminal").

5. Commit and push:
```bash
git commit -m "[message]"
git push origin main
```
