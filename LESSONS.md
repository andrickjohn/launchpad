# LaunchPad — Lessons Learned

This file is maintained by Claude Code during the build process.
Before starting each new component, read this file for relevant past mistakes.
Every 5 components, scan all existing code for patterns matching these lessons.

---

## Lesson: TypeScript Strict Mode Requires Explicit Types for Callbacks
**Date:** 2026-02-25
**Component:** Supabase client configuration

**Failure:** Initial implementation of Supabase cookie handlers had implicit `any` types for callback parameters, causing TypeScript strict mode compilation errors.

**Root Cause:** The `setAll` callback function parameter `cookiesToSet` and its destructured properties (`name`, `value`, `options`) were not explicitly typed.

**Fix:** Added explicit type annotations:
```typescript
setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[])
```

**Prevention:**
- Always explicitly type function parameters in TypeScript strict mode
- Pay special attention to callback functions and their parameters
- Use the `CookieOptions` type from `@supabase/ssr` for cookie-related types

---

## Lesson: Use Current Supabase Packages, Not Deprecated Ones
**Date:** 2026-02-25
**Component:** Supabase setup

**Observation:** The `@supabase/auth-helpers-nextjs` package is deprecated and shows warnings during installation.

**Resolution:** Used `@supabase/ssr` package instead, which is the current recommended approach for Next.js integration.

**Prevention:**
- Check package documentation for deprecation notices before installing
- Use `@supabase/ssr` for Next.js 13+ projects
- Follow the official Supabase docs for the latest patterns

---

## Lesson: Environment Variable Precedence in Next.js
**Date:** 2026-02-25
**Component:** Local Supabase setup, authentication testing

**Failure:** "Failed to fetch" error persisted even after updating `.env` file to use local Supabase URL. The application continued trying to connect to production Supabase URL.

**Root Cause:** Shell environment variables take precedence over `.env` file in Next.js. The terminal session had `NEXT_PUBLIC_SUPABASE_URL` set in its environment, which overrode the `.env` file configuration. Even after `unset`, the parent process environment persisted.

**Fix:**
1. Unset environment variables AND start dev server in the SAME shell command
2. Delete `.next` cache folder (contains compiled code with old env vars baked in)
3. Restart dev server: `rm -rf .next && unset NEXT_PUBLIC_SUPABASE_URL && npm run dev`

**Prevention:**
- Check for shell environment variables FIRST when env vars don't match expected values: `printenv | grep SUPABASE`
- Always delete `.next` cache when changing `NEXT_PUBLIC_*` environment variables
- Remember: Shell env vars > `.env.local` > `.env` (highest to lowest precedence)
- Verify environment variables are correct by checking the HTML/JS served to browser, not just server logs

---

## Lesson: Content Security Policy Blocks Localhost in Production CSP
**Date:** 2026-02-26
**Component:** Authentication, local Supabase connection

**Failure:** "Failed to fetch" error when submitting login form. Browser console showed CSP violation:
```
Connecting to 'http://127.0.0.1:54321/auth/v1/otp' violates the following Content Security Policy directive: "connect-src 'self' https://*.supabase.co"
```

**Root Cause:** The `next.config.js` file had a Content Security Policy configured for production (only allowing `https://*.supabase.co`), which blocked connections to local Supabase instance (`http://127.0.0.1:54321`).

**Fix:** Updated CSP in `next.config.js` to allow localhost:
```javascript
"connect-src 'self' https://*.supabase.co http://127.0.0.1:* http://localhost:*"
```

**Prevention:**
- Always check CSP configuration when setting up local development with external services
- Browser DevTools Console shows CSP violations clearly - check it FIRST when fetch fails
- Consider environment-specific CSP (strict for production, relaxed for development)
- Test actual browser behavior, not just curl/server responses

---

## Lesson: Must Use Browser Testing for Client-Side Issues
**Date:** 2026-02-26
**Component:** Authentication testing, environment variable verification

**Failure:** Spent multiple attempts trying to fix "Failed to fetch" using curl and server-side verification, which couldn't detect the actual client-side CSP issue or environment variable compilation problems.

**Root Cause:**
1. `curl` doesn't execute JavaScript or respect CSP policies
2. Server logs don't show what environment variables are compiled into client bundles
3. Browser caching and CSP policies only affect actual browser requests

**Fix:**
1. Installed Playwright for automated browser testing
2. Created test script that actually submits forms and checks browser console output
3. Used `open` command to launch real browser for visual verification
4. Test revealed the actual error: CSP blocking localhost connections

**Prevention:**
- **ALWAYS test client-side features in an actual browser, not with curl**
- Use automated browser testing (Playwright/Puppeteer) for repeatable verification
- Check browser DevTools Console for errors - it shows CSP violations, failed fetches, and actual runtime values
- Use `open http://localhost:3000/page` on macOS to launch browser programmatically
- For environment variables that are compiled into client bundles (`NEXT_PUBLIC_*`), verify by inspecting browser network requests or rendered HTML, not server logs
- When debugging "Failed to fetch", check browser console FIRST for actual error details

**Testing Protocol Going Forward:**
1. For client-side features: Test in browser with DevTools open
2. For API endpoints: Test with curl first, then browser
3. For environment variables: Check both server logs AND browser console
4. For CSP/CORS issues: Browser console is the only source of truth
5. Create automated Playwright tests for critical user flows

---

**Fix:**
- Use `.env.local` file instead (has highest precedence in Next.js)
- OR start a completely fresh terminal session
- OR find and remove env vars from shell profile files

**Prevention:**
- Always verify environment variables in the running application with `console.log`
- Check `process.env` in browser DevTools console
- Test that `.env` changes actually apply before assuming they work
- Never assume - always verify with actual runtime values
- Use `.env.local` for local development overrides

---

## Lesson: Browser Testing is Mandatory for Client-Side Features
**Date:** 2026-02-25
**Component:** Login page, magic link authentication

**Failure:** Relied on `curl` and HTTP tests to verify login functionality, but these tests passed while the browser showed "Failed to fetch" error.

**Root Cause:** CLI tools like `curl` test the HTTP layer but don't replicate browser JavaScript environment. The actual issue was in client-side code reading environment variables.

**Fix:** Open actual browser, use DevTools, check console logs, test the real user flow.

**Prevention:**
- **MANDATORY**: Test all client-side features in an actual browser
- **MANDATORY**: Open browser DevTools console during testing
- **MANDATORY**: Verify network requests in DevTools Network tab
- CLI tools are supplementary, not sufficient for UI testing
- Add browser-based E2E tests with Playwright for critical flows

---

## Lesson: Track and Clean Up Background Processes
**Date:** 2026-02-25
**Component:** Dev server management

**Failure:** Started 5+ dev servers in background using `&`, creating multiple conflicting servers on different ports. System reminders showed running processes that were ignored.

**Root Cause:** Used background bash processes (`&`) without proper tracking or cleanup. Each new attempt to "restart" the server actually created an additional server.

**Fix:**
- Kill ALL old processes before starting new ones
- Use `KillShell` for all background bash jobs
- Check `lsof` to verify ports are clear
- Monitor system reminders for leaked processes

**Prevention:**
- Use single supervised process, not multiple background jobs
- Always verify old process is dead before starting new one
- Track every background process started
- Clean up background processes when done testing
- Check system reminders regularly

---

## Lesson: Respect the 3-Attempt Limit (Escalation Protocol)
**Date:** 2026-02-25
**Component:** Debugging "Failed to fetch" error

**Failure:** Continued trying different fixes (updating env vars, killing servers, clearing cache, adding debug logs) beyond the 3-attempt limit without proper diagnosis or escalation.

**Root Cause:** Didn't follow CLAUDE.md escalation protocol. After 3 failed attempts, should have stopped, documented the issue, and escalated to user instead of continuing to guess.

**Fix:** After 3 attempts:
1. Document all attempts in LESSONS.md
2. Create comprehensive diagnostic report
3. STOP trying more "fixes"
4. Escalate to user with specific questions

**Prevention:**
- **MANDATORY**: Stop after 3 failed attempts
- **MANDATORY**: Each attempt must be fully tested before trying next approach
- **MANDATORY**: Create diagnostic report after 3 failures
- **MANDATORY**: Ask user for help rather than continuing to guess
- Do not try random fixes without understanding root cause

---

## Lesson: Test Each Fix Immediately Before Moving to Next
**Date:** 2026-02-25
**Component:** Multi-step debugging process

**Failure:** Applied multiple fixes in sequence (kill servers → clear cache → unset env vars → add logging) without testing each one individually.

**Root Cause:** Rushed through fixes without verifying each step. This made it impossible to know which fix (if any) actually addressed the problem.

**Fix:** Apply ONE fix, test it completely, verify the result, then move to next fix if needed.

**Prevention:**
- **MANDATORY**: Test immediately after each change
- **MANDATORY**: Verify in browser, not just in terminal
- **MANDATORY**: Confirm the issue is fixed before applying more changes
- One change at a time
- Document what you tested and the result

---

## Self-Annealing Note

**Current count:** 8 components completed (Stage A) + 3 components (Stage B)
**Next annealing checkpoint:** After component #10

**Patterns to watch for:**
1. Assuming without verifying (especially env vars)
2. Using curl instead of browser for UI testing
3. Starting background processes without cleanup
4. Continuing past 3-attempt limit
5. Not testing each fix individually

---

**IMPORTANT:** Before building next component, review all lessons above and avoid repeating these mistakes.
