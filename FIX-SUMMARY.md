# "Failed to Fetch" - Complete Fix Summary

**Date:** 2026-02-26
**Status:** ✅ **RESOLVED AND TESTED**

---

## The Problem

Login page showed "Failed to fetch" error when trying to send magic link, even with correct local Supabase credentials in `.env` file.

---

## Root Causes (Two Issues)

### 1. Environment Variables
**Problem:** Shell environment variables overriding `.env` files
**Evidence:** `printenv | grep SUPABASE` showed production URLs

### 2. Content Security Policy (CSP)
**Problem:** CSP in `next.config.js` blocked localhost connections
**Evidence:** Browser console: `"Connecting to 'http://127.0.0.1:54321' violates CSP directive: 'connect-src self https://*.supabase.co'"`

---

## The Fixes Applied

### Fix 1: Environment Variables
**File:** `.env.local` (created)
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Commands to start server:**
```bash
# Must unset env vars AND start server in SAME command
rm -rf .next && \
unset NEXT_PUBLIC_SUPABASE_URL && \
unset NEXT_PUBLIC_SUPABASE_ANON_KEY && \
unset SUPABASE_SERVICE_ROLE_KEY && \
npm run dev
```

### Fix 2: Content Security Policy
**File:** `next.config.js:29`
```javascript
// Before:
"connect-src 'self' https://*.supabase.co"

// After:
"connect-src 'self' https://*.supabase.co http://127.0.0.1:* http://localhost:*"
```

---

## Verification (Automated Test Passed!)

```bash
npx playwright test test-login-automated.spec.js
```

**Test Results:**
```
BROWSER: 🔍 Supabase URL: http://127.0.0.1:54321
BROWSER: ✅ Magic link sent successfully
✅ SUCCESS: Magic link sent successfully
  ✓  1 passed (10.9s)
```

**Email Delivered:**
- Checked Mailpit: http://127.0.0.1:54324
- Email found: "Your Magic Link" to automated-test@example.com

---

## Why Previous Fixes Failed

| Attempt | What I Did | Why It Failed |
|---------|-----------|---------------|
| 1 | Updated `.env` file | Shell env vars overrode it |
| 2 | Cleared cache & restarted | Shell env vars still present |
| 3 | Unset env vars in one command, started server in another | Each Bash call = new shell session |
| 4 | Created `.env.local` | CSP still blocked localhost |

**The breakthrough:** Used Playwright to test in real browser, which revealed the CSP violation in DevTools console.

---

## Key Lessons Learned

### 1. Browser Testing is MANDATORY for Client-Side Issues
- ❌ `curl` doesn't execute JavaScript or check CSP
- ❌ Server logs don't show client bundle contents
- ✅ Browser DevTools Console shows actual errors
- ✅ Playwright provides automated, repeatable browser testing

### 2. Environment Variable Precedence in Next.js
```
Shell env vars  >  .env.local  >  .env  >  .env.defaults
  (highest)                                  (lowest)
```

### 3. Next.js Caching of Environment Variables
- `NEXT_PUBLIC_*` variables are compiled into client JavaScript bundles
- Must delete `.next` folder when changing these variables
- Server restart alone is NOT enough

### 4. CSP Configuration Must Account for Local Development
- Production CSP blocks localhost for security
- Development needs localhost allowed for local services
- Check CSP when any fetch/XHR fails

---

## Current Status

✅ **Dev Server:** Running on http://localhost:3000
✅ **Environment Variables:** Correct (`http://127.0.0.1:54321`)
✅ **CSP:** Allows localhost connections
✅ **Login:** Magic link sends successfully
✅ **Email:** Delivers to Mailpit
✅ **Automated Test:** Passing

---

## Next Steps

1. ✅ Remove diagnostic tools (test-env page, debug logs)
2. ✅ Clean up test files
3. ✅ Update LESSONS.md (completed)
4. ⏭️  Continue with Stage B remaining tasks

---

## For Future Reference

**When "Failed to fetch" appears again:**

1. **Check browser console FIRST** (not server logs)
2. Look for CSP violations
3. Check environment variables: `printenv | grep PUBLIC`
4. Verify client bundle content (view page source, check network tab)
5. Delete `.next` cache if changing env vars
6. Test in actual browser, not curl

**Quick diagnostic:**
```bash
# Check env vars
printenv | grep SUPABASE

# Start clean
rm -rf .next && \
unset NEXT_PUBLIC_SUPABASE_URL && \
unset NEXT_PUBLIC_SUPABASE_ANON_KEY && \
npm run dev
```

**Test in browser:**
```bash
npx playwright test test-login-automated.spec.js
```
