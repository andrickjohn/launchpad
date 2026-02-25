# Test Specification: Authentication

## Acceptance Criteria
- [ ] User can sign up with email (magic link)
- [ ] User can log in with magic link
- [ ] Unauthenticated users are redirected to login
- [ ] Session persists across page refreshes
- [ ] User can log out
- [ ] VA users see restricted interface

## Unit Tests
- Test: auth middleware detects missing session → Expected: redirect to /login
- Test: auth middleware detects valid session → Expected: pass through
- Test: role detection returns correct role → Expected: 'owner' or 'va'

## Integration Tests
- Test: sign up flow creates user in Supabase → Expected: user record exists
- Test: login flow sets session cookie → Expected: cookie present, valid
- Test: protected API route without auth → Expected: 401 response
- Test: protected API route with auth → Expected: 200 response

## E2E Tests
- Flow: visit /app → redirected to /login → enter email → receive magic link → click → arrive at /app/prospects
- Flow: logged-in user refreshes page → still logged in
- Flow: VA logs in → sees restricted interface (no settings, no billing)

## Security Tests
- Test: forge session token → Expected: rejected, 401
- Test: access API route with expired token → Expected: 401
- Test: VA user attempts owner-only action → Expected: 403

## Edge Cases
- Expired magic link → friendly error message with resend option
- Multiple rapid login attempts → rate limited gracefully
- Browser with cookies disabled → clear error message

## What "Done" Looks Like
A user can sign up, receive a magic link email, click it, and land on the Prospects screen.
Refreshing keeps them logged in. Logging out sends them to the login page. VA users
see a restricted version of the interface.
