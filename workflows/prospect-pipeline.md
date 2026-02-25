# Workflow: Prospect Pipeline

## Trigger: New prospect added (via CSV import or manual entry)

## Steps:

### Step 1: Data Validation
- Validate email format
- Check for duplicates against existing prospects
- Normalize company name
- If validation fails → flag for user review, do not proceed

### Step 2: AI Scoring
- Send prospect data to Claude Haiku scoring prompt
- Score 1-5 based on: profile completeness, industry match, engagement signals
- Store score and reasoning

### Step 3: Acquisition Quality Check (GATE)
- Evaluate prospect on:
  - Reachability (1-5): Can we contact them directly?
  - Intent Signal (1-5): Have they shown they need this?
  - Decision Speed (1-5): Can they buy without a procurement process?
- If ANY score < 4 → move to nurture list, log reason, STOP
- If all scores ≥ 4 → proceed to Step 4

### Step 4: Current Alternative Tagging
- Determine what the prospect is currently using:
  - direct_competitor (using Apollo, Instantly, etc.)
  - indirect_tool (using Notion, spreadsheets as CRM)
  - manual_workaround (doing it all manually)
  - status_quo (not doing outreach at all)
- Tag determines which outreach variant they receive

### Step 5: Outreach Queue
- Add prospect to outreach queue with:
  - AI score
  - Quality check scores
  - Alternative tag
  - Assigned outreach sequence variant
- Notify user: "X new prospects ready for outreach review"

### Step 6: Draft Generation (Assisted mode only)
- Generate personalized email draft via Claude Haiku
- Use prospect profile + alternative tag to select template variant
- Place draft in approval queue
- User reviews, edits, approves or rejects
