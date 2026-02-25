# QA Strategy — LaunchPad

## Philosophy
Nothing reaches the user until it passes all tests. Every component is built, verified,
and reviewed before moving to the next. The codebase gets cleaner over time via
self-annealing.

## Testing Layers

### Unit Tests (Vitest)
- Every utility function
- Every data transformation
- Every validation schema
- Run: `npm run test:unit`

### Integration Tests (Vitest + Supabase local)
- API routes with real database operations
- Service classes with mocked external APIs
- Auth flows
- Run: `npm run test:integration`

### End-to-End Tests (Playwright)
- Full user flows through the browser
- All three screens
- Campaign creation → prospect import → outreach → dashboard
- Run: `npm run test:e2e`

### Visual Verification (Playwright screenshots)
- Every screen at desktop (1920x1080), tablet (768x1024), mobile (375x812)
- Saved to `/qa/screenshots/`
- Run: `npm run test:visual`

### Performance Audit (Lighthouse CLI)
- Every page: Performance 80+, Accessibility 90+, SEO 80+, Best Practices 80+
- Results saved to `/qa/lighthouse/`
- Run: `npm run test:lighthouse`

### Security Tests
- Auth bypass attempts on every protected route
- SQL injection attempts on every input
- XSS attempts on every text field
- CSRF token validation
- Run: `npm run test:security`

## Tool Installation
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D playwright @playwright/test
npm install -D lighthouse
npm install -D @axe-core/playwright
```

## Self-Correction Protocol
- Test fails → diagnose root cause → fix → re-test (max 3 loops)
- Code review fails → diagnose → fix → re-review (max 2 loops)
- Browser test fails → diagnose → fix → re-verify (max 3 loops)
- Still failing after max loops → escalate to user with full diagnosis

## Self-Annealing Protocol
- Every fix logged to LESSONS.md
- Before each new component: read LESSONS.md
- Every 5 components: scan all code for past mistake patterns, refactor
- LESSONS.md format:
  ```
  ## Lesson: [Title]
  - Failure: [what went wrong]
  - Root cause: [why]
  - Fix: [what you did]
  - Prevention: [rule for future]
  ```

## Code Review Protocol (apply to every file)
- [ ] Security: input validation, auth enforcement, no secrets, no injection
- [ ] Performance: no N+1 queries, efficient algorithms, lazy loading
- [ ] Quality: clear naming, comments on complex logic, no dead code
- [ ] Accessibility: semantic HTML, ARIA labels, keyboard navigation, contrast
- [ ] Maintainability: single responsibility, clear interfaces, documented deps

## Demo-Ready Gate
Before presenting any stage as done:
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Responsive at 3 viewports
- [ ] Lighthouse targets met
- [ ] User flow works end to end
- [ ] PROGRESS.md current
