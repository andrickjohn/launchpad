# Testing Instructions - Environment Variable Fix

## Status
✅ Dev server running on http://localhost:3000
✅ `.env.local` file created with local Supabase credentials
✅ Next.js confirmed loading `.env.local` (shown in server output: "Environments: .env.local, .env")

## What Was Fixed
Created `.env.local` file which has **highest precedence** in Next.js environment variable loading:
- Shell environment variables < `.env` file < `.env.local` file

This should override any shell environment variables that were causing the issue.

## Testing Steps

### Step 1: Verify Environment Variables Are Correct
1. Open browser to: **http://localhost:3000/test-env**
2. Check that you see:
   - URL: `http://127.0.0.1:54321` ✅
   - Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6...` ✅

**If you see `https://your-project.supabase.co`**: The fix didn't work. Shell env vars are still overriding.

### Step 2: Test Magic Link Login
1. Open browser to: **http://localhost:3000/login**
2. Open **Browser DevTools** (F12 or Cmd+Option+I)
3. Go to **Console** tab
4. Enter an email address: `test@example.com`
5. Click "Send magic link"
6. **Check the console output** for debug messages:
   ```
   🔍 Supabase URL: http://127.0.0.1:54321
   🔍 Attempting login with email: test@example.com
   ✅ Magic link sent successfully
   ```

### Step 3: Verify Email Was Sent
1. Open Mailpit (local mail catcher): **http://127.0.0.1:54324**
2. You should see an email from Supabase with the magic link

## Expected Results

### ✅ SUCCESS
- Test page shows correct local Supabase URL
- Console shows "Magic link sent successfully"
- Green success message appears: "Check your email for the magic link!"
- Mailpit shows the email

### ❌ FAILURE
- Test page shows production Supabase URL (https://...)
- Console shows "Failed to fetch" error
- Red error message appears
- No email in Mailpit

## If It Still Fails

The shell environment variables are being set from a source that overrides even `.env.local`. Possible sources:

1. **VS Code terminal settings** - Terminal integrated into VS Code may inherit env vars
2. **direnv** - Check if you have `.envrc` file
3. **LaunchDaemon/LaunchAgent** - macOS system-level env vars

**Next steps if failure:**
```bash
# Check for direnv
which direnv
cat .envrc 2>/dev/null

# Check VS Code settings
cat .vscode/settings.json | grep -i env

# Try completely new terminal
# 1. Quit VS Code completely
# 2. Open Terminal.app (not VS Code terminal)
# 3. cd to project
# 4. npm run dev
# 5. Test again
```

## Current Dev Server Status
- Running on port 3000
- Loading both `.env.local` and `.env`
- Supabase local instance running on 127.0.0.1:54321
- Mailpit available on 127.0.0.1:54324

## After Testing
Please report back:
1. What does http://localhost:3000/test-env show?
2. What appears in browser console when you click "Send magic link"?
3. Does the login succeed or still show "Failed to fetch"?
