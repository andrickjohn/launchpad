---
description: Sync changes to git — review before committing
---

You are syncing the current work to git. Be careful and selective.

## 1. Show what changed
Run `git status` and `git diff --stat` to see all changes.

## 2. Safety check
Before staging, check for files that should NOT be committed:
- `.env` or `.env.local` (secrets)
- Any file with API keys or tokens
- `node_modules/` (should be in .gitignore)
- Large binary files
- Temporary debug/test scripts

If any dangerous files are in the changes, warn the user and exclude them.

## 3. Stage changes selectively
Stage files by name, NOT `git add .` or `git add -A`. Group related files logically.

## 4. Show the user what's staged
Run `git diff --cached --stat` so the user sees exactly what's going into the commit.

## 5. Write a meaningful commit message
Analyze the staged changes and write a commit message that:
- Summarizes the "why" not the "what"
- Is 1-2 sentences max
- Uses conventional format (e.g., "Fix action card crash on flexible AI content shapes")

Ask the user if they want to customize the message, or accept the suggested one.

## 6. Commit and push
```
git commit -m "<message>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push origin main
```

## 7. Confirm
Show the commit hash and confirm it pushed successfully.
