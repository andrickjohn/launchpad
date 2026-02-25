# LaunchPad — Stage 2 Build Brief

You are building LaunchPad, a personal launch command center for a solo founder.
This file is your single source of truth. Read it fully before writing any code.

---

## PRODUCT CONTEXT (ALREADY DECIDED — DO NOT RE-DEBATE)

**What**: A three-screen dashboard that composes pay-as-you-go APIs (Apify, Resend,
Claude Haiku, Reddit API) into a single clean interface for product launch outreach.

**Who**: The founder — one person launching products across different industries.
Not a SaaS to sell. A personal tool. Maybe opened to other solo founders later.

**Why**: Existing tools (Apollo, Instantly, Lemlist) are bloated and expensive ($200+/mo).
Manual alternatives (spreadsheets + platform-hopping) waste 6+ hours/week. LaunchPad
sidesteps both: under $10/month, one dashboard, surgical precision.

**Positioning**: NOT competing with outreach SaaS. COMPOSING cheaper APIs into a
command center. The philosophy: "Why pay $200/month for bloated tools when you can
compose Apify + Resend + Claude Haiku + Reddit API for under $10?"

---

## THE THREE SCREENS

### Screen 1 — Prospects
- Unified prospect list for current campaign
- Import: CSV (Apify scrape results), manual entry, any spreadsheet
- Prospect profiles with full touchpoint timeline
- AI buttons: "Score these prospects" and "Find more like these"
- Industry-agnostic: works for dentists, insurance adjusters, YouTubers, GovCon, anyone

**Campaign Setup Wizard (AI-powered)**:
When creating a new campaign, the user describes: product, target buyer, price, geography.
AI analyzes and produces a Launch Brief containing:
- Ranked channel recommendations with specific methods
- Estimated prospect volume per channel
- Expected response rates
- Concrete first-week plan
- Pre-configured Apify scrape queries ready to run
- Different products get completely different playbooks
  (GovCon → LinkedIn + SAM.gov; Dentists → Google Maps + Yelp + cold email)
- Design: clear, dead simple, visual. Use the screen real estate.

### Screen 2 — Outreach
- Compose and send emails via Resend API
- Email sequences: 3-step drips with scheduling
- Draft queue for AI-generated messages awaiting approval
- Social draft area: LinkedIn/Reddit/Facebook (AI writes, user copy-pastes — NO automation that violates TOS)
- Template library
- AI buttons: "Draft cold email for this prospect" and "Draft Reddit reply to this post"
- Focus on thoroughness and clarity

### Screen 3 — Dashboard
- Campaign overview with key metrics
- Activity feed (all actions, chronological)
- Metrics: response rate, conversion rate, best-performing templates
- Upcoming schedule (next emails, follow-ups due)
- Reddit keyword monitor (via Reddit API)
- Channel updates: LinkedIn, Facebook groups, etc.
- Everything clickable. Rich use of color and contrast.
- Design like a million-dollar SaaS — polished, professional, dense with information

### Two Modes Per Action
- **Manual**: Dashboard shows what needs doing. User does it.
- **Assisted**: AI analyzes, explains, plans, drafts, schedules follow-ups, monitors.
  Includes an "Overachiever" area that proposes additional market penetration tactics.
  User approves before anything goes out.

### VA Mode
- Invite a VA by email
- VA can execute approved actions only
- VA cannot: approve, change templates, access billing
- Full activity log of all VA actions

---

## TECH STACK (LOCKED)

| Component | Technology | Cost | Free Tier Limit |
|-----------|-----------|------|-----------------|
| Framework | Next.js 14 (App Router) | $0 | — |
| Database | Supabase | $0 | 500MB storage, 2GB bandwidth |
| Hosting | Vercel | $0 | 100GB bandwidth, 100 hrs compute |
| Email | Resend | $0 | 100 emails/day |
| Scraping | Apify | ~$5/run | Pay per scrape |
| AI Drafts | Claude Haiku (Anthropic API) | ~$0.25/1K | Pay per use |
| Monitoring | Reddit API | $0 | Rate limited |
| Auth | Supabase Auth | $0 | Included |
| Styling | Tailwind CSS | $0 | — |

**Monthly target**: Under $10 at launch volumes
**Total build budget**: $75-100
**Infrastructure upgrade triggers**: Don't upgrade until revenue justifies it.

---

## BUILD-VERIFY-LEARN LOOP (MANDATORY)

For EVERY component you build, follow this exact cycle:

### 1. BUILD
Write the code. Keep components small and focused.

### 2. VERIFY (before moving on)
Run all relevant tests:
- Unit tests pass
- Integration tests pass
- Browser renders correctly at desktop (1920x1080), tablet (768x1024), mobile (375x812)
- Lighthouse: Performance 80+, Accessibility 90+, SEO 80+
- No TypeScript errors
- No console errors

### 3. SELF-CORRECT (if verification fails)
- Diagnose root cause (not symptoms)
- Fix the root cause
- Re-verify
- Max 3 attempts. If still failing after 3, log the issue and escalate to user.

### 4. LOG (always)
After every component, update PROGRESS.md:
```
## [Component Name] — [Status: ✅ Complete / 🔄 In Progress / ❌ Blocked]
- Built: [what was built]
- Tests: [pass/fail summary]
- Issues: [any problems encountered]
- Time: [approximate time spent]
```

### 5. LEARN (after every fix)
If you fixed a bug or corrected an issue, log it to LESSONS.md:
```
## Lesson: [Short title]
- Failure: [what went wrong]
- Root cause: [why]
- Fix: [what you did]
- Prevention: [how to avoid this in future components]
```
Before starting EACH new component, read LESSONS.md for relevant past mistakes.

---

## SELF-ANNEALING PROTOCOL

Every 5 components completed:
1. Read LESSONS.md in full
2. Scan ALL existing code for patterns matching past mistakes
3. Refactor any matches found
4. Log refactoring to PROGRESS.md

This means the codebase gets cleaner over time, not messier.

---

## CODE REVIEW PROTOCOL (APPLY TO EVERY FILE)

Before marking any component done, review against these checklists:

**Security**: Input validation on all user inputs. Auth enforced on all protected routes.
No secrets in code. No SQL injection vectors. XSS prevention. CSRF tokens.

**Performance**: No N+1 queries. Efficient algorithms. Proper caching headers.
Lazy loading for images and heavy components. No unnecessary re-renders.

**Quality**: Clear naming. Comments on complex logic. No dead code. DRY principles.
Single responsibility per function/component.

**Accessibility**: Semantic HTML. ARIA labels where needed. Keyboard navigation.
Color contrast meets WCAG AA. Focus management.

---

## BUILD SEQUENCE

Follow this exact order. Do NOT skip ahead.

### Stage A: Foundation (Day 1)
1. Initialize Next.js 14 project with TypeScript and Tailwind
2. Configure Supabase connection
3. Set up authentication (email + magic link via Supabase Auth)
4. Create database schema (prospects, campaigns, outreach, templates, activity_log, users)
5. Create shared layout with navigation between three screens
6. Verify: app loads, auth works, database connected, all three screen shells render

### Stage B: Prospects Screen (Day 2)
1. Prospect list view with sorting and filtering
2. CSV import (parse Apify output format + generic CSV)
3. Manual prospect entry form
4. Prospect detail view with touchpoint timeline
5. AI "Score these prospects" button (Claude Haiku integration)
6. AI "Find more like these" button (suggests sources, optional Apify trigger)
7. Campaign Setup Wizard — full AI-powered flow
8. Verify: all CRUD works, import works, AI buttons return results, wizard generates playbook

### Stage C: Outreach Screen (Day 3)
1. Email composer with Resend integration
2. Email sequence builder (3-step drips with scheduling)
3. Draft queue (AI-generated messages awaiting approval)
4. Social draft area (LinkedIn/Reddit/Facebook tabs — text drafting, copy button)
5. Template library (create, edit, use templates)
6. AI "Draft cold email" and "Draft Reddit reply" buttons
7. Verify: can compose, schedule, send email via Resend, drafts queue works

### Stage D: Dashboard Screen (Day 4)
1. Campaign overview cards (active campaigns, total prospects, emails sent)
2. Activity feed (chronological, all actions)
3. Metrics display (response rate, conversion, best templates)
4. Upcoming schedule (next emails, follow-ups due)
5. Reddit keyword monitor setup and display
6. Channel updates section
7. Verify: data flows from Prospects/Outreach to Dashboard, metrics calculate correctly

### Stage E: Modes & VA System (Day 5)
1. Manual vs Assisted mode toggle (per-action, not global)
2. Assisted mode: AI analysis, drafting, scheduling, "Overachiever" suggestions
3. VA invitation system (email invite via Supabase Auth)
4. VA permissions (execute only — no approve, no templates, no billing)
5. VA activity log
6. Verify: both modes work, VA can log in with correct restrictions

### Stage F: Polish & Integration (Day 6)
1. Full integration test: create campaign → import prospects → score → draft outreach → send → see on dashboard
2. Visual polish: color, contrast, spacing — "million dollar SaaS" look
3. Responsive check: desktop, tablet, mobile
4. Lighthouse audit and fixes
5. Error handling and loading states throughout
6. Verify: complete user flow works end to end, Lighthouse scores meet targets

### Stage G: Deployment (Day 7)
1. Environment variables configured on Vercel
2. Supabase production project (or use same free tier project)
3. Deploy to Vercel
4. Verify production: auth, database, email sending, AI features all work
5. Run full E2E test against production URL
6. Update PROGRESS.md with final status

---

## PROGRESS TRACKING

Maintain PROGRESS.md at the project root. Update it after every component.
Format:

```markdown
# LaunchPad Build Progress

## Current Stage: [A/B/C/D/E/F/G]
## Current Component: [name]
## Last Updated: [timestamp]

### Stage A: Foundation
- [ ] Next.js init — [status]
- [ ] Supabase connection — [status]
...
```

If you are resumed after a rate limit or interruption, READ PROGRESS.md FIRST
to determine where you left off. Do not restart completed work.

---

## RATE LIMIT HANDLING

If you hit a rate limit or are interrupted:
1. Before stopping, update PROGRESS.md with exactly where you are
2. When resumed, read PROGRESS.md and continue from that point
3. Never restart a completed component
4. Never re-output a file that's already been written and verified

---

## TEST SPECIFICATIONS

See `/qa/test-specs/` for detailed test specifications for every component.
See `/qa/QA-STRATEGY.md` for the overall testing approach.

When building each component, read its test spec FIRST, then build to pass those tests.

---

## ESCALATION PROTOCOL

If you encounter something you cannot resolve after 3 attempts:
1. Log the full issue to PROGRESS.md including what you tried
2. Tell the user: "I'm blocked on [X]. I tried [Y]. I need your input on [Z]."
3. Continue with the next independent component while waiting
4. Do NOT silently skip or work around the issue

---

## DEMO-READY GATE

Before presenting any stage as "done" to the user, confirm:
- [ ] All tests for that stage pass
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Responsive at all three viewports
- [ ] Lighthouse Performance 80+, Accessibility 90+
- [ ] The user flow for that stage works end to end
- [ ] PROGRESS.md is current
