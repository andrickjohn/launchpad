---
description: Ship - run pre-flight checks and deploy to production
---

# /ship - Ship to GitHub

Run pre-flight checks, commit, and push all current work-in-progress safely to the remote repository.

## Steps

1. Fetch latest from remote and check for divergence:
// turbo-all
```bash
git fetch origin && git status -sb
```

- If remote is **ahead** or **diverged**, STOP and tell the user to run `/sync` first to avoid safely overwriting their remote changes.
- If the directory is already clean and up to date, let the user know there's nothing to ship.

2. Review changes to be shipped:
```bash
git status -s
```

3. Confirm with the user before proceeding to stage, commit, and push.

4. If confirmed, ask for a commit message (default: "Update from launchpad terminal").

5. Stage, commit, and push:
```bash
git add -A
git commit -m "[message]"
git push origin main
```
