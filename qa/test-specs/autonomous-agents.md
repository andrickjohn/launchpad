# Test Specification: Background Automation

## Note
For v1, "autonomous agents" are really just scheduled tasks and AI-powered
features triggered by user actions. No always-running background agents.

## Acceptance Criteria
- [ ] Reddit keyword monitor runs on schedule, surfaces relevant posts
- [ ] Scheduled email sequences fire on time
- [ ] Campaign metrics recalculate periodically
- [ ] Activity feed updates in near-real-time

## Integration Tests
- Test: Reddit API keyword search returns results → Expected: parsed, stored, displayed
- Test: scheduled sequence step fires at correct time → Expected: email sent
- Test: metrics recalculation produces correct numbers → Expected: matches manual calc

## What "Done" Looks Like
Background tasks run reliably without user intervention. Reddit monitor surfaces
relevant posts. Sequences fire on schedule. Metrics stay current.
