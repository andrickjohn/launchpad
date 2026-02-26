# Fix Applied: "Failed to Fetch" Issue ✅

**Date:** 2026-02-25
**Issue:** Login page showing "Failed to fetch" error
**Root Cause:** Shell environment variables were overriding `.env` file configuration

---

## Problem Diagnosis

### What Was Wrong:
1. **Shell Environment Variables**: The terminal session had production Supabase URLs set as environment variables
2. **Variable Precedence**: Shell env vars take precedence over `.env` file
3. **Multiple Dev Servers**: 4+ old dev servers running with cached configurations
4. **Browser Cache**: Browser had cached JavaScript with old URLs

### Verification:
```bash
$ env | grep SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co  # OLD/WRONG
```

This was overriding `.env`:
```bash
$ cat .env | grep SUPABASE_URL
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321  # CORRECT (local)
```

---

## Fix Applied

### Step 1: Killed All Background Dev Servers ✅
```bash
pkill -9 -f "next dev"
pkill -9 -f "npm run dev"
```

### Step 2: Unset Shell Environment Variables ✅
```bash
unset NEXT_PUBLIC_SUPABASE_URL
unset NEXT_PUBLIC_SUPABASE_ANON_KEY
unset SUPABASE_SERVICE_ROLE_KEY
```

### Step 3: Cleared Next.js Cache ✅
```bash
rm -rf .next
```

### Step 4: Added Debug Logging ✅
Added console.log statements to login component to show:
- Which Supabase URL is being used
- Login attempt status
- Any errors that occur

### Step 5: Started Fresh Dev Server ✅
```bash
npm run dev
# Server now running on: http://localhost:3002
```

---

## How to Test

### 1. Open the App
```bash
open http://localhost:3002/login
```

**Important:** Use port **3002** (not 3000, 3001, or 3003)

### 2. Open Browser DevTools
- Press `F12` or `Cmd+Option+I`
- Go to **Console** tab
- Keep it open to see debug logs

### 3. Try Login
1. Enter email: `test@example.com`
2. Click "Send magic link"
3. **Watch the console output**

### Expected Console Output:
```
🔍 Supabase URL: http://127.0.0.1:54321
🔍 Attempting login with email: test@example.com
✅ Magic link sent successfully
```

### If Successful:
- ✅ No "Failed to fetch" error
- ✅ Success message: "Check your email for the magic link!"
- ✅ Check Mailpit: http://127.0.0.1:54324

---

## Verification Steps

### Check 1: Verify Environment Variables in Browser Console
Open console and type:
```javascript
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

**Expected:** `http://127.0.0.1:54321`
**Wrong:** `https://your-project.supabase.co` or `undefined`

### Check 2: Verify Network Request
1. Open DevTools → **Network** tab
2. Try to send magic link
3. Look for request to `auth/v1/otp`
4. Check the **Request URL**

**Expected:** `http://127.0.0.1:54321/auth/v1/otp`
**Wrong:** `https://your-project.supabase.co/auth/v1/otp`

### Check 3: Test Mailpit
After successful login request:
1. Open Mailpit: http://127.0.0.1:54324
2. You should see an email with magic link
3. Click the link to complete login

---

## Troubleshooting

### If Still Getting "Failed to Fetch"

#### Issue: Browser has cached old code
**Solution:**
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
- Or use Incognito/Private window

#### Issue: Old dev servers still running
**Solution:**
```bash
# Check for running processes
ps aux | grep "next dev"

# Kill any you find
kill -9 <PID>

# Restart
npm run dev
```

#### Issue: Environment variables still set in shell
**Solution:**
```bash
# Check current env vars
env | grep SUPABASE

# If you see production URLs, unset them:
unset NEXT_PUBLIC_SUPABASE_URL
unset NEXT_PUBLIC_SUPABASE_ANON_KEY
unset SUPABASE_SERVICE_ROLE_KEY

# Then restart dev server
```

#### Issue: Wrong port
**Solution:**
Check which port the server is actually running on:
```bash
lsof -i :3000,3001,3002,3003 | grep LISTEN
```

Use the correct port in your browser.

---

## Permanent Fix for Future Sessions

To prevent this from happening again, check if env vars are set in your shell profile:

```bash
# Check shell profiles
grep -r "SUPABASE" ~/.zshrc ~/.bashrc ~/.bash_profile ~/.profile

# If found, comment them out or remove them
# The .env file should be the ONLY source of env vars
```

---

## Current Status

✅ **Fixed:** Environment variable conflicts resolved
✅ **Cleared:** All cached builds and old servers
✅ **Running:** Fresh dev server on port 3002
✅ **Added:** Debug logging for troubleshooting
⏳ **Testing:** Ready for you to test login

---

## Next Steps

1. **Test login** at http://localhost:3002/login
2. **Check console** for debug output
3. **Verify success** in Mailpit
4. **Complete login** via magic link
5. **Test prospect features** after login

---

## Debug Information

**Server:** http://localhost:3002
**Supabase:** http://127.0.0.1:54321
**Mailpit:** http://127.0.0.1:54324
**Studio:** http://127.0.0.1:54323

**Environment Variables (should be empty in shell):**
```bash
$ env | grep SUPABASE
# (should show nothing)
```

**Environment Variables (from .env file):**
```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

**The fix has been applied. Please test at http://localhost:3002/login** 🚀
