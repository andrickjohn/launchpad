---
description: End of session — save state, push, clean up
---

You are ending a work session on LaunchPad. Ensure everything is saved and the other machine can pick up cleanly.

## 1. Check for uncommitted work
Run `git status`. If there are uncommitted changes, stage and commit them with a descriptive message (follow the /sync workflow rules — no `git add .`, stage selectively, check for secrets).

## 2. Update PROGRESS.md
Read the current PROGRESS.md. Update it with:
- What was worked on this session
- Current status of in-progress features
- Any blockers or issues encountered
- What should be done next

Keep it concise. This is the handoff document for the next session.

## 3. Push everything
```
git push origin main
```
Verify the push succeeded.

## 4. Kill dev server and background processes
```
pkill -f "next dev" 2>/dev/null
```
Clean up any background processes started during this session.

## 5. Final status check
```
git status
```
Confirm working directory is clean. If there are untracked files that shouldn't be committed, mention them to the user.

## 6. Session summary
Give the user a brief summary:
- **Completed**: what got done this session
- **Pushed**: commit hash and what's in it
- **Next up**: what to work on next session
- **Blockers**: anything that needs attention

End with: "Your other machine will be up to date after `git pull`. Run /hello to start."
