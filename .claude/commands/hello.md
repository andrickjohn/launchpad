---
description: Start of session — sync, clean slate, show status
---

You are starting a new work session on LaunchPad. Follow these steps exactly:

## 1. Kill zombie processes
Kill any leftover dev servers or node processes from previous sessions:
```
pkill -f "next dev" 2>/dev/null
```

## 2. Pull latest code
```
git pull --rebase origin main
```
If there are merge conflicts, stop and tell the user.

## 3. Install dependencies (only if package.json changed)
Check if package.json changed in the pull. If so:
```
npm install
```

## 4. Clear stale build cache
The .next cache bakes in environment variables. Always clear it when switching machines:
```
rm -rf .next
```

## 5. Verify database connection
Run a quick check that cloud Supabase is reachable:
```
node -e "const{createClient}=require('@supabase/supabase-js');const s=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'https://xlskskaecxooczbpebui.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsc2tza2FlY3hvb2N6YnBlYnVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNjI1MzgsImV4cCI6MjA4NzYzODUzOH0.XSBexu4qxmw6B4FB1OVY68DoRDBIz5xN1IYj1FiiJvY');s.from('campaigns').select('id').limit(1).then(({error})=>console.log(error?'DB: UNREACHABLE - '+error.message:'DB: Connected'))"
```
If unreachable, warn the user but continue.

## 6. Start dev server
```
npm run dev
```
Run this in the background. Wait a few seconds, then verify localhost:3000 responds.

## 7. Read project status
Read PROGRESS.md and LESSONS.md. Then give the user a concise summary:

- **Current stage** and what's complete
- **Last commit** message and date
- **What was being worked on** (from PROGRESS.md)
- **Any open issues or blockers**
- **Git status** — any uncommitted changes from last session

Format this as a clear status briefing, not a wall of text.
