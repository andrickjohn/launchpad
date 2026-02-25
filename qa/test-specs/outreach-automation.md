# Test Specification: Outreach Automation

## Acceptance Criteria
- [ ] Assisted mode: AI analyzes prospect and suggests outreach approach
- [ ] Assisted mode: AI drafts emails based on prospect profile and template
- [ ] Assisted mode: AI schedules follow-ups based on engagement
- [ ] Assisted mode: "Overachiever" section suggests additional tactics
- [ ] Manual mode: shows checklist of what needs doing, user executes
- [ ] Mode toggle works per-action (not global switch)
- [ ] All AI actions require user approval before execution

## Integration Tests
- Test: AI analysis endpoint returns structured recommendation → Expected: JSON with approach, reasoning
- Test: AI draft endpoint returns email draft → Expected: subject + body matching prospect context
- Test: follow-up scheduler based on engagement → Expected: correct timing, respects cooldowns

## E2E Tests
- Flow: switch to assisted mode → AI suggests outreach plan → approve → emails drafted
- Flow: assisted mode proposes follow-up → user approves → scheduled correctly
- Flow: manual mode shows task list → user completes tasks → progress updates

## What "Done" Looks Like
In assisted mode, the AI does the thinking and drafting — user just reviews and approves.
In manual mode, the dashboard is a clear task list. Both modes track progress identically.
