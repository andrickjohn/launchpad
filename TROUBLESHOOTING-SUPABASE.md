# Troubleshooting: "Failed to Fetch" Error

**Issue:** Login page shows "Failed to fetch" when trying to send magic link

**Root Cause:** Environment variables were cached by Next.js from previous configuration

---

## Solution Applied

### 1. Cleared Next.js Cache
```bash
rm -rf .next
```

### 2. Killed All Dev Servers
```bash
pkill -9 -f "next dev"
pkill -9 -f "npm run dev"
```

### 3. Restarted Server
```bash
npm run dev
```

**Server now running on:** http://localhost:3001

---

## How to Test

### Test 1: Check Environment Variables
The app should connect to local Supabase at `http://127.0.0.1:54321`

```bash
# Verify .env file
cat .env | grep SUPABASE_URL
# Should show: NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
```

### Test 2: Test Supabase Connection Directly
```bash
# Test Supabase REST API
curl -s http://127.0.0.1:54321/rest/v1/ \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

# Should return JSON with API documentation
```

### Test 3: Try Login Again
1. Visit http://localhost:3001/login
2. Enter email: `test@example.com`
3. Click "Send magic link"

**Expected:** Should successfully send request (check server logs)

**Magic Link Location:** Check Mailpit at http://127.0.0.1:54324

---

## Common Issues

### Issue: Still getting "Failed to fetch"

**Check 1: Is Supabase running?**
```bash
supabase status
```

**Check 2: Are there multiple dev servers running?**
```bash
ps aux | grep "next dev"
# Kill all with: pkill -9 -f "next dev"
```

**Check 3: Is .env file correct?**
```bash
cat .env | head -10
# Should show local Supabase URL, not production
```

### Issue: "Connection refused"

**Supabase not running**
```bash
supabase start
```

### Issue: "Invalid API key"

**Wrong anon key in .env**

The local Supabase default anon key is:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

---

## Current Status

✅ **Server:** Running on http://localhost:3001
✅ **Supabase:** Running on http://127.0.0.1:54321
✅ **Database:** Migrated and ready
✅ **API:** Requires authentication (working correctly)
⏳ **Login:** Ready to test

---

## Next Steps

1. **Open the app:** http://localhost:3001/login
2. **Test magic link login**
3. **Check Mailpit for email:** http://127.0.0.1:54324
4. **If still failing:** Check browser console for specific error message

---

## Debug Mode

To see exactly what's happening in the browser:

1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Try to send magic link
4. Look for the request to Supabase
5. Check the request URL (should be http://127.0.0.1:54321/...)
6. Check response

If you see a request to `your-project.supabase.co` instead of `127.0.0.1`, then:
- Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R)
- Clear browser cache
- Restart dev server again
