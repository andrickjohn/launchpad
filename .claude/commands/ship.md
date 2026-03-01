---
description: Build, verify, and ship to production via Vercel
---

You are shipping LaunchPad to production. This must pass all quality gates.

## 1. TypeScript check
```
npx tsc --noEmit
```
If there are errors, fix them before proceeding. Do NOT skip this step.

## 2. Lint check
```
npm run lint 2>&1
```
Fix any lint errors. Warnings are OK to ship.

## 3. Production build
```
npm run build
```
This must succeed. If it fails, diagnose and fix before proceeding.

## 4. Review what's shipping
Run `git diff origin/main...HEAD --stat` to show everything that will deploy.
If there are uncommitted changes, run the /sync workflow first.

## 5. Push to trigger deploy
```
git push origin main
```

## 6. Verify deployment
Check if the Vercel deployment succeeded. Try:
```
gh api repos/andrickjohn/launchpad/deployments --jq '.[0] | {state: .statuses_url, environment: .environment, created_at: .created_at}' 2>/dev/null
```

If `gh` is not available, tell the user to check:
- Vercel dashboard: https://vercel.com/dashboard
- Or the production URL directly

## 7. Production smoke test
Once deployed, test the production URL:
```
curl -s -o /dev/null -w "%{http_code}" https://launchpad-[vercel-url].vercel.app
```
Report the HTTP status.

## 8. Summary
Tell the user:
- What was shipped (commit hash, file count, summary)
- Build status (pass/fail)
- Deploy status (if verifiable)
- Any warnings or concerns
