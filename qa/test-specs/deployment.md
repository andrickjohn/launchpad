# Test Specification: Deployment

## Acceptance Criteria
- [ ] Deploys to Vercel without errors
- [ ] All environment variables configured
- [ ] Database migrations run on production Supabase
- [ ] Auth works in production (magic links send, sessions persist)
- [ ] API routes work in production
- [ ] No CORS issues
- [ ] HTTPS enforced
- [ ] Lighthouse scores meet targets on production URL

## Deployment Tests
- Test: build succeeds → Expected: `next build` exits 0
- Test: production URL loads → Expected: 200 status
- Test: auth flow works on production → Expected: magic link sends, login succeeds
- Test: API route on production → Expected: returns expected data
- Test: Lighthouse on production URL → Expected: meets targets

## Security Tests
- Test: .env not accessible via URL → Expected: 404
- Test: source maps not exposed → Expected: not accessible
- Test: security headers present → Expected: CSP, X-Frame-Options, etc.

## What "Done" Looks Like
The app is live on a Vercel URL, all features work, it's fast, secure, and
ready for daily use.
