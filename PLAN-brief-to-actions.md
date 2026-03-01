# Brief → Action Items: Complete Implementation Plan

**Date**: 2026-02-28
**Feature**: Turn launch briefs into executable, day-by-day campaign action plans
**Estimated Implementation Cost**: ~$2.50–$4.00 (Claude Code API calls)

---

## What This Builds

When a user generates a Launch Brief, they currently get strategic recommendations but no executable content. This feature adds **one click** to turn a brief into a full campaign with AI-generated content:
- Email drafts with subject lines and personalized body text
- Social media posts (LinkedIn, Reddit, Facebook) with actual copy
- Scrape configurations with Apify actor IDs and queries
- Manual tasks (research, profile setup, etc.)
- All organized day-by-day (Days 1–7), ready to review, edit, approve, and execute

**User's words**: "Full AI generated plans and content. Be able to edit approve and cherry pick. Then be organized and led day by day activities."

---

## New Feature: Model Selector + AI Processing Indicator

**Improvement from bragging_rights.md**: The existing app already tracks which model powers each AI feature via `MODEL_ASSIGNMENTS`. This plan adds two visible UX elements:

### A. Model Display During AI Processing
Every AI-powered button (Score Prospects, Generate Brief, Activate Campaign, Draft Email) shows a processing indicator with the model name:

```
┌──────────────────────────────────────────┐
│  ◐ Generating with Claude Sonnet 4.6...  │
│  ░░░░░░░░░░░█████████                    │
└──────────────────────────────────────────┘
```

This is a reusable `<AIProcessingIndicator model={modelInfo} />` component used everywhere AI runs.

### B. Model Selector on Settings Page
A new "AI Models" section in Settings where the user can override the default model tier for each function:

| Function | Default | Options |
|----------|---------|---------|
| Launch Brief | Sonnet | Haiku / Sonnet / Opus |
| Prospect Scoring | Haiku | Haiku / Sonnet / Opus |
| Email Drafting | Haiku | Haiku / Sonnet / Opus |
| Social Drafting | Haiku | Haiku / Sonnet / Opus |
| Campaign Activation | Sonnet | Haiku / Sonnet / Opus |

Model overrides stored in `localStorage` (no DB needed — personal tool). Each option shows estimated cost per call. The `getModelForFeature()` helper checks localStorage override first, then falls back to `MODEL_ASSIGNMENTS`.

---

## UX Polish Improvements (from bragging_rights.md)

These refinements match the existing "million-dollar SaaS" quality bar:

1. **Color-coded channel badges** — Blue=Email, Purple=LinkedIn, Orange=Reddit, Green=Facebook, Slate=Task, Amber=Scrape. Consistent with the existing color system (Blue=Campaigns, Purple=Prospects, Green=Success, Orange=Responses).

2. **Gradient progress bars** — Reuse the `bg-gradient-to-r from-blue-600 via-purple-600 to-green-600` pattern from CampaignProgress on the Review and Mission Control pages.

3. **Smooth animations** — Slide-down for expanding action cards (reuse `animate-slide-down` from CampaignProgress), pulse for in-progress items, scale on hover for buttons.

4. **Empty states that guide** — When no actions exist yet: "Your launch brief is ready. Activate it to generate a full campaign plan with emails, social posts, and daily tasks." with a prominent CTA button.

5. **Dense information display** — Mission Control shows stats grid (total actions, approved, completed, skip rate) matching the CampaignProgress quick-stats pattern.

6. **Toast notifications** — Reuse existing Toast system for all actions (approve, skip, complete, bulk operations).

---

## Implementation Steps

### Step 1: Database Migration
**File**: `supabase/migrations/003_campaign_actions.sql`
**Model**: None (no AI) | **Claude Code cost**: ~$0.05

```sql
-- campaign_actions table
CREATE TABLE campaign_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  channel TEXT NOT NULL,
  action_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add activated_at to campaigns
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;

-- RLS policies (matching existing patterns)
-- Indexes for performance
```

### Step 2: Type Definitions
**File**: `src/lib/types/database.ts` (edit)
**Model**: None | **Claude Code cost**: ~$0.02

Add `CampaignAction` interface, `ActionStatus` type, `ActionChannel` type, and `CampaignActionContent` type (union of email/social/scrape/task content shapes). Update `Campaign` interface to include `activated_at`.

### Step 3: AI Processing Indicator Component
**File**: `src/components/ui/AIProcessingIndicator.tsx` (new)
**Model**: None | **Claude Code cost**: ~$0.05

Reusable component that shows:
- Animated spinner/pulse
- Model name and version (e.g., "Claude Sonnet 4.6")
- Optional progress text ("Generating 24 action items...")
- Gradient shimmer effect matching existing design language

### Step 4: Model Selector Utilities + Settings UI
**Files**: `src/lib/ai/models.ts` (edit), `src/app/(app)/settings/page.tsx` (edit)
**Model**: None | **Claude Code cost**: ~$0.10

- Add `campaignActivation: 'sonnet'` to `MODEL_ASSIGNMENTS`
- Add `getModelForFeature(feature)` that checks localStorage override first
- Add `setModelOverride(feature, tier)` and `getModelOverride(feature)`
- New "AI Models" card in Settings with dropdowns per feature, showing cost estimates
- Each dropdown shows: model name, cost per 1K tokens, best-for description

### Step 5: DB Helper Functions
**File**: `src/lib/db/campaign-actions.ts` (new)
**Model**: None | **Claude Code cost**: ~$0.05

Functions following existing patterns in `src/lib/db/campaigns.ts`:
- `getActionsByCampaign(campaignId)` — all actions ordered by day + sort_order
- `getActionsByDay(campaignId, day)` — single day's actions
- `updateAction(id, updates)` — partial update
- `bulkUpdateStatus(ids[], status)` — bulk status change
- `getActionStats(campaignId)` — counts by status for progress display

### Step 6: Activate Campaign API Route
**File**: `src/app/api/campaigns/[id]/activate/route.ts` (new)
**AI Model**: Sonnet (user-overridable) — complex content generation
**Claude Code cost**: ~$0.15

`POST /api/campaigns/[id]/activate`

This is the core AI endpoint. It:
1. Reads the campaign's `launch_brief` (channels + first_week_plan)
2. Reads the user's model preference for `campaignActivation`
3. Sends to Claude with a structured prompt that generates concrete action items
4. For each day in the first_week_plan, generates channel-specific content:
   - **Email drafts**: `{ subject, body, target_description }` — personalized cold email copy
   - **Social posts**: `{ platform, message, context }` — LinkedIn/Reddit/Facebook copy
   - **Scrape configs**: `{ actor_id, queries, description }` — ready-to-run Apify configs
   - **Manual tasks**: `{ description, estimated_time }` — research, profile setup, etc.
5. Inserts all actions into `campaign_actions`
6. Sets `campaigns.activated_at = NOW()`
7. Returns the full action list + model info used

**AI Prompt**: Takes the full launch_brief JSON + campaign context → outputs structured JSON array of 20-30 action items. Uses the same JSON extraction + repair pattern as generate-brief.

**Response includes**: `{ success, actions, stats: { total, byDay, byChannel }, model: { name, version, id } }`

### Step 7: Actions CRUD API Routes
**Files**: `src/app/api/campaigns/[id]/actions/route.ts`, `src/app/api/campaigns/[id]/actions/bulk/route.ts` (new)
**Model**: None | **Claude Code cost**: ~$0.10

- `GET /api/campaigns/[id]/actions` — Fetch all actions, grouped by day
- `PATCH /api/campaigns/[id]/actions` — Update single action (edit content, change status)
- `POST /api/campaigns/[id]/actions/bulk` — Bulk approve/reject/skip: `{ action_ids[], status }`

All follow existing auth pattern with `getAuthUser()`.

### Step 8: ActionCard Component
**File**: `src/components/campaigns/ActionCard.tsx` (new)
**Model**: None | **Claude Code cost**: ~$0.15

The building block for both Review and Mission Control pages.

**Features**:
- Channel badge (color-coded icon + label)
- Title + content preview (collapsed by default)
- Expand to show full content (email subject+body, social message, etc.)
- Three action buttons: Approve (green check), Edit (pencil), Skip (X)
- **Inline editing mode**: Click edit → fields become editable → save/cancel
- Status indicator (pending=slate, approved=green, skipped=slate-strikethrough, completed=green-check)
- Smooth expand/collapse animation (reuse `animate-slide-down`)
- Hover state: subtle shadow lift + border color change

**Channel color mapping**:
- Email → `blue-600` (envelope icon)
- LinkedIn → `blue-700` (linkedin icon)
- Reddit → `orange-500` (message-circle icon)
- Facebook → `indigo-600` (globe icon)
- Scrape → `amber-600` (search icon)
- Task → `slate-600` (clipboard icon)

### Step 9: DayGroup Component
**File**: `src/components/campaigns/DayGroup.tsx` (new)
**Model**: None | **Claude Code cost**: ~$0.08

Groups ActionCards by day with:
- "Day 1 — Monday" header with day-specific color accent
- "Approve All Day" button
- Per-day progress indicator (e.g., "3 of 5 approved")
- Collapsible accordion behavior
- Summary line when collapsed: "5 actions: 2 emails, 1 LinkedIn post, 2 tasks"

### Step 10: ActionReviewPage Component
**File**: `src/components/campaigns/ActionReviewPage.tsx` (new)
**Model**: None | **Claude Code cost**: ~$0.15

Main client component for the Review page.

**Layout**:
```
┌────────────────────────────────────────────────────────┐
│  ← Back to Campaign                                    │
│                                                        │
│  Review Campaign Actions                               │
│  24 actions generated across 7 days                    │
│                                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ████████████████░░░░░░  16 of 24 approved       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  [Approve All Remaining]  [Start Mission Control →]    │
│                                                        │
│  ▼ Day 1 — Monday  (4 of 5 approved)                  │
│    ┌──────────────────────────────────────────┐        │
│    │ 📧 Email: Cold outreach to segment A     │        │
│    │ Subject: "Quick question about..."       │        │
│    │ [✓ Approve] [✎ Edit] [✗ Skip]           │        │
│    └──────────────────────────────────────────┘        │
│    ┌──────────────────────────────────────────┐        │
│    │ 🔗 LinkedIn: Connection request post     │        │
│    │ "Excited to connect with..."             │        │
│    │ [✓ Approve] [✎ Edit] [✗ Skip]           │        │
│    └──────────────────────────────────────────┘        │
│                                                        │
│  ▶ Day 2 — Tuesday  (0 of 4 approved)                 │
│  ▶ Day 3 — Wednesday  (0 of 3 approved)               │
│  ...                                                   │
└────────────────────────────────────────────────────────┘
```

**Interactions**: Approve/skip update optimistically (show result, revert on API failure). Edit opens inline. Bulk approve sends single API call. Progress bar animates on changes.

### Step 11: Review Page (Server Component)
**File**: `src/app/(app)/campaigns/[id]/review/page.tsx` (new)
**Model**: None | **Claude Code cost**: ~$0.05

Server component that fetches campaign + all actions via DB helpers, then renders `<ActionReviewPage>`. Includes metadata for SEO. Uses `notFound()` if campaign doesn't exist.

### Step 12: MissionControl + DayTimeline + ActionExecutionCard Components
**Files**: `src/components/campaigns/MissionControl.tsx`, `src/components/campaigns/DayTimeline.tsx`, `src/components/campaigns/ActionExecutionCard.tsx` (new)
**Model**: None | **Claude Code cost**: ~$0.25

**MissionControl.tsx** — Main client component. Two-panel layout:
```
┌──────────────────────────────────────────────────────────┐
│  Mission Control — Campaign Name                         │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ 24 Total │ │ 16 Ready │ │ 8 Done   │ │ 33% ✓    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                          │
│  ┌─────────────┬────────────────────────────────────┐   │
│  │  TIMELINE   │  DAY 3 — WEDNESDAY                 │   │
│  │             │                                     │   │
│  │  ✓ Day 1   │  ┌─────────────────────────────┐   │   │
│  │  ✓ Day 2   │  │ 📧 Cold email to segment B  │   │   │
│  │  ● Day 3 ◄─│  │ Subject: "Following up..."  │   │   │
│  │  ○ Day 4   │  │ [Copy] [Send via Resend]     │   │   │
│  │  ○ Day 5   │  │ [✓ Mark Complete]            │   │   │
│  │  ○ Day 6   │  └─────────────────────────────┘   │   │
│  │  ○ Day 7   │                                     │   │
│  │             │  ┌─────────────────────────────┐   │   │
│  │             │  │ 🔗 LinkedIn post             │   │   │
│  │             │  │ "Excited to announce..."     │   │   │
│  │             │  │ [Copy to Clipboard]          │   │   │
│  │             │  │ [✓ Mark Complete]            │   │   │
│  │             │  └─────────────────────────────┘   │   │
│  └─────────────┴────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

**DayTimeline.tsx** — Vertical timeline showing all 7 days:
- Past days: green check + completion %
- Current day: highlighted with pulse + "Today" badge
- Future days: gray circle + action count
- Click any day to navigate to it

**ActionExecutionCard.tsx** — Execution-focused card (only shows approved actions):
- Full content display (no collapse needed — you're executing)
- Channel-specific action buttons:
  - **Email**: "Copy to Clipboard" + "Send via Resend" (if prospect linked)
  - **Social**: "Copy to Clipboard" with platform icon
  - **Scrape**: "Open in Apify" link (external)
  - **Task**: Checkbox to mark done
- "Mark Complete" button with green confirmation
- Completed items get green background + strikethrough

### Step 13: Mission Control Page (Server Component)
**File**: `src/app/(app)/campaigns/[id]/mission-control/page.tsx` (new)
**Model**: None | **Claude Code cost**: ~$0.05

Server component. Only shows **approved** actions (filtered). If no actions approved, shows empty state: "Approve some actions in Review first."

### Step 14: Campaign Detail Page Update
**File**: `src/app/(app)/campaigns/[id]/page.tsx` (edit)
**Model**: None | **Claude Code cost**: ~$0.10

Below the existing Launch Brief section, add:

**If campaign has brief but NOT activated**:
```
┌─────────────────────────────────────────────┐
│  🚀 Ready to Activate                      │
│                                              │
│  Your launch brief is ready. Activate it    │
│  to generate emails, social posts, scrape   │
│  configs, and daily tasks.                  │
│                                              │
│  [⚡ Activate Campaign]                     │
│                                              │
│  Powered by Claude Sonnet 4.6               │
│  Estimated: 20-30 action items (~$0.08)     │
└─────────────────────────────────────────────┘
```

The "Activate Campaign" button:
- Shows `<AIProcessingIndicator>` while generating
- On success, redirects to `/campaigns/[id]/review`

**If campaign IS activated** (`activated_at` is set):
```
┌─────────────────────────────────────────────┐
│  Campaign Activated ✓  (Feb 28, 2026)       │
│  24 actions • 16 approved • 8 completed     │
│                                              │
│  [Review Actions]  [Mission Control →]      │
└─────────────────────────────────────────────┘
```

### Step 15: Loading Skeletons
**Files**: `src/app/(app)/campaigns/[id]/review/loading.tsx`, `src/app/(app)/campaigns/[id]/mission-control/loading.tsx` (new)
**Model**: None | **Claude Code cost**: ~$0.05

Match existing skeleton patterns (slate-200 dark:slate-700 animate-pulse). Review skeleton shows progress bar + 3 day groups with 2-3 card placeholders each. Mission Control skeleton shows timeline + card placeholders.

### Step 16: Integration Testing & Polish
**Model**: None | **Claude Code cost**: ~$0.20

- `npx tsc --noEmit` — zero errors
- `npm run build` — clean build
- Visual review of all new pages
- Test the full flow: Campaign → Generate Brief → Activate → Review → Approve → Mission Control → Complete
- Verify dark mode on all new components
- Verify responsive behavior (mobile: timeline stacks above cards)

---

## Model Routing Summary

| Feature | Default Model | Estimated Cost/Call | Overridable? |
|---------|--------------|--------------------:|:------------:|
| Launch Brief Generation | Sonnet 4.6 | ~$0.08 | Yes |
| Campaign Activation | Sonnet 4.6 | ~$0.08 | Yes |
| Prospect Scoring | Haiku 3.5 | ~$0.002 | Yes |
| Prospect Similarity | Haiku 3.5 | ~$0.002 | Yes |
| Email Drafting | Haiku 3.5 | ~$0.002 | Yes |
| Social Drafting | Haiku 3.5 | ~$0.002 | Yes |

**Why Sonnet for Campaign Activation**: This endpoint generates 20-30 pieces of content (emails with subject/body, social posts, task descriptions) in a single call. Haiku produces noticeably lower quality for long-form creative content. Sonnet hits the sweet spot: high-quality drafts for ~$0.08/activation. User can override to Opus for maximum quality (~$0.80/activation) or Haiku for budget mode (~$0.01/activation).

---

## Claude Code Execution Cost Estimate

This is the estimated cost of Claude Code (Opus) executing this plan:

| Step | Description | Est. Turns | Est. Cost |
|------|-------------|--------:|----------:|
| 1 | DB migration | 2 | $0.05 |
| 2 | Type definitions | 2 | $0.05 |
| 3 | AI Processing Indicator | 3 | $0.10 |
| 4 | Model selector + Settings | 5 | $0.20 |
| 5 | DB helpers | 3 | $0.10 |
| 6 | Activate API route | 5 | $0.25 |
| 7 | Actions CRUD routes | 4 | $0.15 |
| 8 | ActionCard component | 5 | $0.25 |
| 9 | DayGroup component | 3 | $0.10 |
| 10 | ActionReviewPage | 5 | $0.25 |
| 11 | Review page (server) | 2 | $0.05 |
| 12 | MissionControl + Timeline + ExecutionCard | 8 | $0.40 |
| 13 | Mission Control page | 2 | $0.05 |
| 14 | Campaign detail update | 4 | $0.15 |
| 15 | Loading skeletons | 2 | $0.08 |
| 16 | Integration test + fixes | 5 | $0.25 |
| | **TOTAL** | **~60** | **~$2.50–$4.00** |

**Note**: Cost depends on conversation length and context size. Steps 6, 8, 10, 12 are the most expensive (complex code generation). Delegating some steps to Sonnet subagents could reduce cost by ~30% but adds coordination overhead.

---

## Files Summary

| Action | File | Lines (est.) |
|--------|------|----------:|
| Create | `supabase/migrations/003_campaign_actions.sql` | ~45 |
| Edit | `src/lib/types/database.ts` | +30 |
| Create | `src/components/ui/AIProcessingIndicator.tsx` | ~50 |
| Edit | `src/lib/ai/models.ts` | +40 |
| Edit | `src/app/(app)/settings/page.tsx` | +80 |
| Create | `src/lib/db/campaign-actions.ts` | ~100 |
| Create | `src/app/api/campaigns/[id]/activate/route.ts` | ~180 |
| Create | `src/app/api/campaigns/[id]/actions/route.ts` | ~90 |
| Create | `src/app/api/campaigns/[id]/actions/bulk/route.ts` | ~50 |
| Create | `src/components/campaigns/ActionCard.tsx` | ~200 |
| Create | `src/components/campaigns/DayGroup.tsx` | ~80 |
| Create | `src/components/campaigns/ActionReviewPage.tsx` | ~250 |
| Create | `src/components/campaigns/MissionControl.tsx` | ~200 |
| Create | `src/components/campaigns/DayTimeline.tsx` | ~100 |
| Create | `src/components/campaigns/ActionExecutionCard.tsx` | ~150 |
| Create | `src/app/(app)/campaigns/[id]/review/page.tsx` | ~40 |
| Create | `src/app/(app)/campaigns/[id]/mission-control/page.tsx` | ~40 |
| Create | `src/app/(app)/campaigns/[id]/review/loading.tsx` | ~30 |
| Create | `src/app/(app)/campaigns/[id]/mission-control/loading.tsx` | ~30 |
| Edit | `src/app/(app)/campaigns/[id]/page.tsx` | +80 |
| **Total** | **20 files (15 new, 5 edited)** | **~1,865 lines** |

---

## Google Gemini Pro Assessment

**Can Gemini 2.0 Pro carry out this plan and follow the CLAUDE.md methodology?**

### Capable Of:
- Writing TypeScript/React/Next.js code at this complexity level
- Following structured prompts and file-by-file instructions
- Generating Tailwind CSS with dark mode
- Creating API routes and database queries
- Understanding and extending existing code patterns

### Concerns:
1. **CLAUDE.md adherence**: Gemini doesn't natively understand `CLAUDE.md` as a project instruction file the way Claude Code does. It would need the full context pasted into each prompt. The Build-Verify-Learn loop, self-annealing protocol, and progress tracking would need to be manually enforced.

2. **Model routing protocol**: The plan references Claude-specific model IDs (`claude-sonnet-4-6`, etc.). Gemini can write this code but can't test the Anthropic API integration. The AI prompt in the activate endpoint is tuned for Claude's JSON output style.

3. **Codebase context**: Gemini 2.0 Pro has a 1M token context window (advantage), but lacks Claude Code's built-in file system access, git integration, and tool-use workflow. You'd need to manually paste files or use a wrapper tool like Cursor/Aider.

4. **Code quality**: For this specific codebase (which was built entirely by Claude), the naming conventions, error handling patterns, and component structure are "Claude-native." Gemini would produce functional but stylistically inconsistent code that would need harmonization.

5. **JSON structured output**: The AI activation prompt relies on Claude's strong JSON output compliance. Gemini's structured output is good but may need `response_mime_type: "application/json"` and slightly different prompt engineering.

### Verdict:
**Gemini 2.0 Pro could execute ~80% of this plan** but would require:
- Manual context management (pasting relevant files)
- Post-hoc code style harmonization
- Separate testing of Anthropic API integration
- Skipping the Build-Verify-Learn loop automation

**Recommendation**: If cost is the driver, use Gemini for the pure UI components (Steps 8-13, 15) and Claude for the AI integration steps (Steps 4, 6, 7) and architecture decisions (Steps 1-3). But for a smooth single-session build, Claude Code with Opus is the better choice — it understands this codebase natively and can execute end-to-end without context switching.

---

## What Changed From the Original Plan

| Improvement | Source | Impact |
|------------|--------|--------|
| **AI Processing Indicator** | New requirement | Users see which model is working and its progress |
| **Model Selector in Settings** | New requirement | Users can override model per feature with cost visibility |
| **Color-coded channel badges** | bragging_rights.md color system | Consistent with existing Blue/Purple/Green/Orange palette |
| **Gradient progress bars** | bragging_rights.md CampaignProgress | Reuses the signature gradient pattern |
| **Smooth animations** | bragging_rights.md micro-interactions | slide-down, pulse, scale-on-hover throughout |
| **Empty states that guide** | bragging_rights.md UX philosophy | Every new page has a helpful empty state with CTA |
| **Dense stats display** | bragging_rights.md "million-dollar SaaS" | Stats grids on Review + Mission Control pages |
| **Cost estimates visible** | New requirement | Users see per-call cost before triggering AI |
| **Model info in API responses** | Existing pattern (generate-brief) | Transparent about which model produced what |
