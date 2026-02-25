# LaunchPad — Build Stages for Claude Code

## How To Use This File

1. Open Claude Code terminal in Antigravity
2. Paste each stage prompt below, one at a time
3. Wait for the stage to complete before pasting the next
4. If rate limited: paste the SAME stage prompt again — Claude Code reads PROGRESS.md to resume

---

## STAGE A: Foundation

Paste this into Claude Code:

```
Read claude.md in the project root — that's your build brief. Then read PROGRESS.md to check current status.

Your task: Complete Stage A (Foundation). Specifically:

1. Initialize Next.js 14 with TypeScript and Tailwind CSS (App Router)
2. Install all dependencies: @supabase/supabase-js, @supabase/auth-helpers-nextjs, resend, zod, recharts, lucide-react
3. Install dev dependencies: vitest, @testing-library/react, playwright, @playwright/test
4. Create the Supabase client configuration in src/lib/supabase/client.ts and server.ts
5. Create the authentication system: middleware.ts for route protection, src/app/login/page.tsx for magic link auth
6. Create the database schema in supabase/migrations/001_initial_schema.sql with all tables from the system overview
7. Create the shared app layout: src/app/(app)/layout.tsx with sidebar navigation between Prospects, Outreach, and Dashboard
8. Create shell pages for all three screens: src/app/(app)/prospects/page.tsx, src/app/(app)/outreach/page.tsx, src/app/(app)/dashboard/page.tsx

Read the coding standards in .claude/rules/coding-standards.md and security rules in .claude/rules/security-rules.md. Follow them exactly.

After each component, verify it works (no TypeScript errors, renders correctly). Update PROGRESS.md after completing each item. If you encounter an issue, log it to LESSONS.md.

When done, confirm: "Stage A complete. App loads, auth works, navigation between all three screens works."
```

---

## STAGE B: Prospects Screen

```
Read claude.md and PROGRESS.md. Read qa/test-specs/core-product.md for acceptance criteria.

Your task: Complete Stage B (Prospects Screen). Build these components:

1. Prospect list page with data table — sortable by name, score, date, status. Filterable by campaign, score range, status.
2. CSV import functionality — handle Apify output format AND generic CSV. Show import progress. Handle errors gracefully with line numbers.
3. Manual prospect entry form with validation (zod schema).
4. Prospect detail view: click a prospect to see full profile + touchpoint timeline.
5. AI "Score these prospects" button: API route that sends prospect data to Claude Haiku (use mock when MOCK_APIS=true), stores scores.
6. AI "Find more like these" button: suggests prospect sources, generates Apify scrape configs.
7. Campaign Setup Wizard: multi-step form where user describes product/target/price/geography → AI generates complete launch brief with channel recommendations, prospect volume estimates, response rate estimates, first-week plan, and Apify configs.

Design the wizard to be visual, clear, and obvious. Use the screen real estate — this is a desktop-first tool with lots of room for information.

Follow the Build-Verify-Learn loop. Read LESSONS.md before starting. Update PROGRESS.md after each component.

When done, confirm: "Stage B complete. Can import CSV, add prospects, view details, score with AI, run Campaign Wizard."
```

---

## STAGE C: Outreach Screen

```
Read claude.md and PROGRESS.md. Read qa/test-specs/email-system.md for acceptance criteria.

Your task: Complete Stage C (Outreach Screen). Build:

1. Email composer with rich text editor and Resend API integration (mock when MOCK_APIS=true)
2. Email sequence builder: create 3-step drip sequences with configurable delays
3. Draft queue: list of AI-generated messages awaiting approval. Approve, reject, or edit.
4. Social media draft area with tabs for LinkedIn, Reddit, Facebook. AI generates drafts, user copies to platform. Include copy-to-clipboard button.
5. Template library: CRUD for reusable templates with variable support ({{first_name}}, etc.)
6. AI "Draft cold email" button on prospect context — uses prompt from prompts/outreach/cold-email-generator.md
7. AI "Draft Reddit reply" button — context-aware, matches community tone
8. Enforce daily send limit (100 for Resend free tier) with clear counter

Focus on thoroughness and clarity in the UI. Follow Build-Verify-Learn loop. Update PROGRESS.md.

When done, confirm: "Stage C complete. Can compose, schedule, send emails. Draft queue works. Social drafts work. Templates work."
```

---

## STAGE D: Dashboard Screen

```
Read claude.md and PROGRESS.md. Read qa/test-specs/landing-page.md (for landing) and the dashboard section of claude.md.

Your task: Complete Stage D (Dashboard Screen + Landing Page). Build:

1. Landing page at / — clean, minimal: product name, description, login button, three feature cards
2. Campaign overview cards: active campaigns, total prospects, emails sent, response rate
3. Activity feed: chronological list of all actions across the app. Clickable — each item links to relevant detail.
4. Metrics display using Recharts: response rate trend, conversion funnel, template performance comparison
5. Upcoming schedule: emails and follow-ups due in next 48 hours
6. Reddit keyword monitor: setup interface + display of matching posts
7. Channel updates section: latest activity from all monitored channels
8. API cost tracking card: estimated spend this month by service

Design like a million-dollar SaaS. Rich color, contrast, dense information. Everything clickable. Use Recharts for charts. Lucide for icons.

Follow Build-Verify-Learn loop. Update PROGRESS.md.

When done, confirm: "Stage D complete. Dashboard shows all metrics, activity feed works, Reddit monitor configured, landing page live."
```

---

## STAGE E: Modes & VA System

```
Read claude.md and PROGRESS.md. Read qa/test-specs/outreach-automation.md.

Your task: Complete Stage E (Modes & VA System). Build:

1. Manual/Assisted mode toggle — per-action, not global. Stored in user preferences.
2. Manual mode: each screen shows a clear task checklist of what needs doing.
3. Assisted mode: AI analysis, draft generation, scheduling, follow-up suggestions.
4. "Overachiever" section in Assisted mode: AI suggests additional market penetration tactics. Displayed as cards user can dismiss or act on.
5. VA invitation system: owner invites VA by email (Supabase Auth invitation).
6. VA role enforcement: UI hides restricted features, API routes reject unauthorized actions.
7. VA activity log: every action the VA takes is logged and visible to owner.

Follow Build-Verify-Learn loop. Update PROGRESS.md.

When done, confirm: "Stage E complete. Both modes work. VA can be invited and has correct restrictions."
```

---

## STAGE F: Polish & Integration

```
Read claude.md and PROGRESS.md. Read qa/test-specs/full-integration.md.

Your task: Complete Stage F (Polish & Integration). Do:

1. Full integration test: create campaign → import prospects → score → draft outreach → approve → send → verify on dashboard. Fix any data flow issues.
2. Visual polish pass on ALL screens: consistent spacing, color, typography. Refer to .claude/rules/output-standards.md.
3. Responsive check: desktop (1920x1080), tablet (768x1024), mobile (375x812). Fix layout issues.
4. Run Lighthouse audit on all pages. Fix until: Performance 80+, Accessibility 90+, SEO 80+.
5. Add comprehensive error handling: loading states (skeleton loaders), error boundaries, toast notifications, empty states with CTAs.
6. Add mock data seeding for development: scripts/seed-data.ts that populates realistic test data.

Take screenshots at all three viewports and save to qa/screenshots/.

Follow Build-Verify-Learn loop. Update PROGRESS.md.

When done, confirm: "Stage F complete. Full user flow works. All screens polished. Lighthouse targets met. Screenshots saved."
```

---

## STAGE G: Deployment

```
Read claude.md and PROGRESS.md. Read qa/test-specs/deployment.md.

Your task: Complete Stage G (Deployment). Do:

1. Verify next build succeeds with zero errors
2. Create vercel.json if needed for configuration
3. Document deployment steps in docs/DEPLOYMENT.md:
   - How to create Vercel project and link
   - Which environment variables to set
   - How to run Supabase migrations on production
4. Run all test suites one final time. Log results to qa/TEST-RESULTS.md.
5. Do a final code review against .claude/rules/security-rules.md. Log to qa/CODE-REVIEW.md.
6. Update PROGRESS.md with final status for all stages.

When done, confirm: "Stage G complete. Build passes. All tests pass. Ready to deploy to Vercel."
```

---

## AFTER ALL STAGES

Once Claude Code confirms Stage G is complete:
1. Review PROGRESS.md — all items should be checked
2. Review qa/TEST-RESULTS.md — all tests should pass
3. Review LESSONS.md — see what was learned during the build
4. Set MOCK_APIS=false in .env.local
5. Add your real API keys
6. Deploy to Vercel: `vercel --prod` (or link via Vercel dashboard)
7. Run the full integration flow on production
8. Start using LaunchPad for your next product launch!
